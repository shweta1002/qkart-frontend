import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart from "./Cart";
import { generateCartItemsFrom } from "./Cart";

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

const Products = () => {
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  const { enqueueSnackbar } = useSnackbar();
  const [filterProducts, setFilterProducts] = useState([]);
  const [formProcessing, setFormProcessing] = useState(false);
  const [debounceTime, setDebounceTime] = useState(0);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem('token');
  
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setFormProcessing(true);
    try {
      const apiResponse = await axios.get(`${config.endpoint}/products`);
      setFormProcessing(false);
      setProducts(apiResponse.data);
      setFilterProducts(apiResponse.data);
      return apiResponse.data;
    } catch (error) {
      setFormProcessing(false);
      enqueueSnackbar(
        `Something went wrong. Check the backend console for more details`,
        { variant: "error" }
      );
    }
  };

  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      const searchResponse = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFormProcessing(false);
      setFilterProducts(searchResponse.data);
      return searchResponse.data;
    } catch (e) {
      if (e.response) {
        if (e.response.status === 404) {
          setFilterProducts([]);
        }
        if (e.response.status === 500) {
          enqueueSnackbar(e.response.message, { variant: "error" });
          setFilterProducts(products);
        }
      } else {
        enqueueSnackbar(
          "Could not fetch the products. check that the backend is running, reachable and return valid JSON",
          { variant: "error" }
        );
      }
      // enqueueSnackbar(`Something went wrong. Check the backend console for more details`, {variant:"error"});
    }
  };

  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(async () => {
      await performSearch(value);
    }, 500);
    setDebounceTime(timeout);
  };

  const EmptyProducts = () => {
    return (
      <Grid container  direction="column"
      justifyContent="center"
      alignItems="center">
        <Grid item >
          <SentimentDissatisfied />
          No products found
        </Grid>
      </Grid>
    );
  };

  useEffect( () => {
    const pageLoad = async () => {
    const allProducts = await performAPICall();
    const cartProducts = await fetchCart(token);
    const cartItemsData = await generateCartItemsFrom(cartProducts, allProducts);
    setCartItems(cartItemsData);
    }

    pageLoad();
  }, []);

  const ListProducts = ({ productList }) => {
    return productList.map((item) => (
      <Grid item xs={6} sm={6} md={3} key={item._id}>
        <ProductCard product={item} 
          handleAddToCart={async () => {
            await addToCart(token,cartItems,products,item._id,1,{preventDuplicate:true})
          }}
         />
      </Grid>
    ));
  };


  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const cartResponse = await axios.get(`${config.endpoint}/cart`,{ headers:{
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }});
      setCartItems(cartResponse.data);
      return cartResponse.data;
    
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    if(items){
      return items.findIndex((item)=>item.productId === productId) !== -1;
    }
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if(!token){
      enqueueSnackbar("Login to add an item to the Cart",{variant:"warning"});
      return;
    }

    if(options.preventDuplicate && isItemInCart(items,productId)){
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.",{variant:"warning"});
      return;
    }

    try{
      const response = await axios.post(`${config.endpoint}/cart`,{productId,qty},{
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`,
        }
      });

      updateCart(response.data, products);
      return response.data;
    }catch(error){
      if(error.response){
        enqueueSnackbar(error.response.data.message,{varuant:"error"});
      }else{
        enqueueSnackbar("Could not fetch products. Check that backend is running",{variant:"error"});
      }
      return null;
    }
  };

  const updateCart = (cartItems, products) => {
    const cartItemsData = generateCartItemsFrom(cartItems, products);
    setCartItems(cartItemsData);
  }

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
        className="search-desktop"
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, debounceTime)}
      />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        autoFocus
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, debounceTime)}

      />
      <Grid container>
        <Grid item className="product-grid"  md={token ? 9 : 12}>
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>

          {/* grid products view */}
          <Grid
            container
            marginY="1rem"
            paddingX="1rem"
            justifyContent="center"
            spacing={2}
          >
            {formProcessing ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                padding="1rem"
              >
                <CircularProgress size={30} />
                <Typography component="div" fontWeight="bold">
                  Loading Products
                </Typography>
              </Box>
            ) : filterProducts.length > 0 ? (
              <ListProducts productList={filterProducts} />
            ) : (
              <EmptyProducts />
            )}
          </Grid>
        </Grid>
        { token && (
        <Grid item xs={12}  md={3} bgcolor="#E9F5E1">
          <Cart products={products} items={cartItems} handleQuantity={addToCart} />
        </Grid>
        )}
        
      </Grid>
        {/* TODO: CRIO_TASK_MODULE_CART - Display the Cart component */}
      <Footer />
    </div>
  );
};

export default Products;

import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card" >
      <CardMedia
        component="img"
        alt={product.name}
        image={product.image}
      />
      <CardContent>
        <Typography gutterBottom variant="p" component="div" fontWeight='bold' >
        {product.name}
        </Typography>
        <Typography gutterBottom variant="p" component="div" fontWeight='bold'>
        ${product.cost}
        </Typography>
        <Rating name="size-medium" defaultValue={product.rating} precision={0.5} readOnly />
      </CardContent>
      <CardActions>
        <Button
        size="large"
        className="card-button"
        fullWidth
        variant="contained"
        startIcon={<AddShoppingCartOutlined />}
        type="button"
        role="button"
        onClick={handleAddToCart}
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;

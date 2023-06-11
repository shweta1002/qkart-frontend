import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {

    const history = useHistory();
    
    return (
      <div>
        
         { (hasHiddenAuthButtons) ? <BackExplore history={history} /> : ( checkLocalStorage()  ? <LoggedIn history={history} child={children} /> : <LoggedOut history={history} child={children} />) }
      </div>
      
    );
};



const checkLocalStorage = () => {
  const localData = (localStorage.getItem('username')!==null) ? localStorage.getItem('username') : null;
  return localData;
}

const LoggedIn  = (props) => {
  return (
    <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon" onClick={() => props.history.push('/')}></img>
        </Box>
        {props.child}
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={1}
        >
          <Avatar alt={localStorage.getItem('username')} src="/broken-image.jpg" sx={{ width: 30, height: 30 }} />
            <Typography gutterBottom size="small" color="text.secondary" spacing={2}>
            {localStorage.getItem('username')}
          </Typography>
          <Button
            className="explore-button"
            variant="text"
            onClick={logoutUser}
          >
            
            LOGOUT
          </Button>
        </Stack>
      </Box>
  )
}



const logoutUser = () => {
  localStorage.clear();
  window.location.reload();
}

const LoggedOut = (props) => {
  
  return (
    <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon" onClick={() => props.history.push('/')}></img>
        </Box>
        {props.child}
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={1}
        >
        <Button
          className="explore-button"
          variant="text"
          onClick={() => props.history.push('/login')}
        >
          LOGIN
        </Button>
        <Button
          variant="contained"
          onClick={() => props.history.push('/register')}
        >
          REGISTER
        </Button>
        </Stack>
      </Box>
  )
}

const BackExplore = (props) => {
  return (
    <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon" onClick={() => props.history.push('/')}></img>
        </Box>
        
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => props.history.push('/')}
        >
          Back to explore
        </Button>
      </Box>
  )
}



export default Header;

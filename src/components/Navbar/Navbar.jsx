import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../../context/CartContext';

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();
  const { getCartItemsCount } = useCart();

  const handleLogoutClick = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      handleLogout();
      navigate('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout the user on the frontend in case of backend errors
      handleLogout();
      navigate('/login');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            MasteryHub
          </Link>
        </Typography>
        <Box>
          {isLoggedIn ? (
            <>
              <IconButton color="inherit" onClick={() => navigate('/cart')} sx={{ mr: 2 }}>
                <Badge badgeContent={getCartItemsCount()} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <Button color="inherit" onClick={handleLogoutClick}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please login to view your cart');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
const response = await fetch('http://localhost:8080/cart', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setError('Session expired. Please login again.');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch cart items: ${response.status}`);
        }

        const data = await response.json();

        const updatedCartItems = data.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
            ? item.product.image.startsWith('data:image')
              ? item.product.image
              : `data:image/png;base64,${item.product.image}`
            : '', 
        }));

        setCartItems(updatedCartItems);
        setError(null);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h6">Your cart is empty</Typography>
        <Typography variant="body2" color="text.secondary">
          Add some products to your cart to see them here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Shopping Cart
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cartItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2 }}>
              <img 
                src={item.image} 
                alt={item.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>{item.name}</Typography>
              <Typography variant="body1" color="primary">${item.price.toFixed(2)}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography>{item.quantity}</Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  size="small"
                  onClick={() => handleRemoveItem(item.id)}
                  sx={{ ml: 'auto' }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5">
          Total: ${getCartTotal().toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClearCart}
          size="large"
        >
          Clear Cart
        </Button>
      </Box>
    </Box>
  );
};

export default Cart;
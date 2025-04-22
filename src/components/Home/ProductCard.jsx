import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const ProductCard = ({ product }) => {
  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const imageUrl = product.image.startsWith('data:image')
    ? product.image
    : `data:image/png;base64,${product.image}`;

  const handleCartToggle = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return;
    }
    const url = `http://localhost:8080/user/product/${product.id}`;
    const method = inCart ? 'DELETE' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to ${inCart ? 'remove' : 'add'} product`);
      }
      setInCart(!inCart);
      setQuantity(inCart ? 0 : 1);
    } catch (error) {
      console.error('Cart operation error:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia component="img" height="140" image={imageUrl} alt={product.name} />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="body2" color="text.secondary">{product.description}</Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>${product.price}</Typography>
      </CardContent>
      {inCart ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
          <IconButton onClick={async () => {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8080/cart/${product.id}/decrease`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) return alert('Failed to update quantity');
            setQuantity(quantity - 1);
            if (quantity <= 1) setInCart(false);
          }} disabled={quantity <= 1}><RemoveIcon /></IconButton>
          <Typography sx={{ mx: 2 }}>{quantity}</Typography>
          <IconButton onClick={async () => {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8080/cart/${product.id}/increase`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) return alert('Failed to update quantity');
            setQuantity(quantity + 1);
          }}><AddIcon /></IconButton>
        </Box>
      ) : (
        <Button variant="contained" color="primary" onClick={handleCartToggle} sx={{ width: '100%' }}>
          Add to Cart
        </Button>
      )}
    </Card>
  );
};

export default ProductCard;
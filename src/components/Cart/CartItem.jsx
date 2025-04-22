import React from 'react';
import { Box, Button, Typography, Grid, IconButton, Alert, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, apiError } = useCart();
  const [loading, setLoading] = React.useState(false);

  const handleQuantityChange = async (newQty) => {
    setLoading(true);
    try {
      await updateQuantity(item.id, newQty);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <Typography variant="h6">{item.name}</Typography>
          <Typography variant="body2">{item.description}</Typography>
        </Grid>
        <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => handleQuantityChange(item.quantity - 1)} disabled={loading || item.quantity <= 1}>
            <RemoveIcon />
          </IconButton>
          {loading ? <CircularProgress size={24} /> : <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>}
          <IconButton onClick={() => handleQuantityChange(item.quantity + 1)} disabled={loading}>
            <AddIcon />
          </IconButton>
        </Grid>
        <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
          <Typography variant="h6">${(item.price * item.quantity).toFixed(2)}</Typography>
        </Grid>
      </Grid>
      {apiError && <Alert severity="error" sx={{ mt: 1 }}>{apiError}</Alert>}
    </Box>
  );
}
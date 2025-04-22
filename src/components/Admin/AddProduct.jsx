import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    image: null
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setProduct(prev => ({
          ...prev,
          image: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login first');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price);
    formData.append('categoryId', product.categoryId);
    formData.append('description', product.description);
    if (product.image) {
      formData.append('image', product.image);
    }

    try {
      const response = await fetch('http://localhost:8080/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const contentType = response.headers.get('content-type');
      let errorMessage = `Request failed: ${response.status}`;
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } else {
        errorMessage = await response.text();
      }

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      navigate('/');
    } catch (err) {
      console.error('Error adding product:', err);
      const message = err.message.includes('Failed to fetch') 
        ? 'Network error - please check your connection'
        : err.message;
      setError(message);
      
      if (err.message.includes('401')) {
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Add New Product</Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Product Name"
          name="name"
          value={product.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Price"
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Category ID"
          name="categoryId"
          type="number"
          value={product.categoryId}
          onChange={handleChange}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={product.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={4}
          required
        />
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Product Image</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <Box sx={{ mt: 2 }}>
              <img 
                src={preview} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px' }} 
              />
            </Box>
          )}
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Product'}
        </Button>
      </form>
    </Box>
  );
};

export default AddProduct;
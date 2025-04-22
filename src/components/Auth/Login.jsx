import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) navigate('/');
  }, [navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid server response format');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 404) {
          throw new Error('User not found');
        } else {
          throw new Error(data.message || 'Login failed');
        }
      }

      if (!data.token) {
        throw new Error('Authentication failed: No token received');
      }
      
      localStorage.setItem('authToken', data.token);
      window.fetch = new Proxy(window.fetch, {
        apply: function(target, thisArg, argumentsList) {
          const [url, config = {}] = argumentsList;
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${token}`
            };
          }
          return target.apply(thisArg, [url, config]);
        }
      });
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setIsLoggedIn(true);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.message);
      const errorMessage = error.message || 'An error occurred during login';
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#fdfdfd',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      elevation={0}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          error={Boolean(errors.password)}
          helperText={errors.password}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>
        <Typography variant="body2">
          Don&apos;t have an account?{' '}
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default Login;

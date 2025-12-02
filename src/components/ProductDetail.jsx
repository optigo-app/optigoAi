'use client';
import React from 'react';

import {
  Container,
  Typography,
  Grid,
  CardMedia,
  Button,
  Box,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function ProductDetail({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={() => router.push('/product')} sx={{ mb: 2 }}>
        ← Back to Products
      </Button>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            height="400"
            image={product.image}
            alt={product.type}
            sx={{ borderRadius: 2, objectFit: 'cover' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.type}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Discover the elegance of this exquisite piece. Crafted with precision and designed for timeless beauty.
          </Typography>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => handleAddToCart(product)}
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
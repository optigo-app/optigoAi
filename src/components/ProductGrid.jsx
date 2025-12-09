'use client';
import React from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { SearchX } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductGrid({ designData, appliedFilters, clearAllFilters }) {
  if (designData.length === 0 && appliedFilters.length > 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <SearchX size={60} color="#9e9e9e" />
        </Box>
        <Typography
          variant="h5"
          color="text.primary"
          fontWeight="medium"
          sx={{ mb: 2 }}
        >
          No products found
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 400 }}
        >
          Try adjusting your filters to see more results.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={clearAllFilters}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          Clear All Filters
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ justifyContent: 'start' }}>
      {designData?.map((product, index) => (
        <Grid
          key={`${product.id}-${index}`}
          size={{
            xs: 6,
            sm: 4,
            md: 3,
            lg: 3,
            xl: 2,
          }}
        >
          <ProductCard product={product} products={designData} index={index} />
        </Grid>
      ))}
    </Grid>
  );
}

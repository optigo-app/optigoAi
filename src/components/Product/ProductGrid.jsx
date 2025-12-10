'use client';
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { SearchX } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductGrid = memo(function ProductGrid({ designData, appliedFilters, clearAllFilters, onSearchSimilar }) {
  const [visibleCount, setVisibleCount] = useState(24);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const ITEMS_PER_LOAD = 24;

  const visibleItems = useMemo(() => {
    return designData.slice(0, visibleCount);
  }, [designData, visibleCount]);

  const hasMore = visibleCount < designData.length;

  const loadMore = () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_LOAD, designData.length));
      loadingRef.current = false;
    }, 0);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      {
        threshold: 0,
        rootMargin: '400px'
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore]);

  useEffect(() => {
    setVisibleCount(24);
    loadingRef.current = false;
  }, [designData]);

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
    <Box>
      <Grid container spacing={2} sx={{ justifyContent: 'start' }}>
        {visibleItems.map((product, index) => (
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
            <ProductCard
              product={product}
              products={designData}
              index={index}
              onSearchSimilar={onSearchSimilar}
            />
          </Grid>
        ))}
      </Grid>

      {/* Sentinel for infinite scroll */}
      {hasMore && (
        <Box
          ref={sentinelRef}
          sx={{
            height: '1px',
            width: '100%',
            mt: 2
          }}
        />
      )}
    </Box>
  );
});

export default ProductGrid;
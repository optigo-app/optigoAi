'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { SearchX } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductGrid = memo(function ProductGrid({
  designData,
  appliedFilters,
  clearAllFilters,
  onSearchSimilar
}) {
  const ITEMS_PER_LOAD = 24;

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  // Slice visible items
  const visibleItems = useMemo(() => {
    return designData.slice(0, visibleCount);
  }, [designData, visibleCount]);

  const hasMore = visibleCount < designData.length;

  // Load more items (24 at a time)
  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;

    requestAnimationFrame(() => {
      setVisibleCount(prev =>
        Math.min(prev + ITEMS_PER_LOAD, designData.length)
      );
      loadingRef.current = false;
    });
  }, [hasMore, designData.length]);

  // Intersection Observer optimized
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          loadMore();
        }
      },
      {
        threshold: 0,
        rootMargin: '800px'   // 👈 load before reaching end
      }
    );

    const node = sentinelRef.current;
    if (node) observer.observe(node);

    return () => observer.disconnect();
  }, [loadMore, hasMore]);


  // Reset when data changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD);
    loadingRef.current = false;
  }, [designData]);

  // Empty result UI
  if (designData.length === 0 && appliedFilters.length > 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8}>
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

        <Typography variant="h5" fontWeight="medium" mb={2}>
          No products found
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          Try adjusting your filters to see more results.
        </Typography>

        <Button variant="contained" size="large" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {visibleItems.map((product, index) => (
          <Grid
            key={`${product.id}-${index}`}
            size={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 2 }}
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

      {/* Single sentinel – clean & stable */}
      {hasMore && (
        <Box
          ref={sentinelRef}
          sx={{ height: '1px', width: '100%' }}
        />
      )}
    </Box>
  );
});

ProductGrid.displayName = 'ProductGrid';
export default ProductGrid;

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Grid,
    Box,
    Typography,
    CircularProgress,
    Button,
    Fade
} from '@mui/material';
import { X, SearchX, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { searchService } from '@/services/apiService';
import { getMatchedDesignCollections } from '@/utils/globalFunc';

export default function SimilarProductsModal({ open, onClose, baseProduct, allProducts, performanceConfig, onSearchSimilar, onBack, canGoBack }) {
    const [loading, setLoading] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [error, setError] = useState(null);
    const [showContent, setShowContent] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Cache to store search results by product ID
    const searchCacheRef = useRef({});

    useEffect(() => {
        if (open && baseProduct) {
            // Trigger fade out
            setShowContent(false);

            // Wait for fade out, then fetch and fade in
            setTimeout(() => {
                fetchSimilarProducts();
                setShowContent(true);
            }, 200);
        }
    }, [open, baseProduct]);

    const fetchSimilarProducts = useCallback(async () => {
        if (!baseProduct) return;

        const imageUrl = baseProduct.ImgUrl || baseProduct.image;
        if (!imageUrl) {
            setError("No image available for this product.");
            return;
        }

        // Check cache first
        const cacheKey = baseProduct.id || baseProduct.designno;
        if (searchCacheRef.current[cacheKey]) {
            console.log('Using cached results for:', cacheKey);
            setSimilarProducts(searchCacheRef.current[cacheKey]);
            return;
        }

        setLoading(true);
        setError(null);
        setSimilarProducts([]);

        try {
            const imageUrl = baseProduct.ImgUrl || baseProduct.image;
            const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch image: ${response.status}`);
            }

            const blob = await response.blob();
            if (blob.size === 0) throw new Error('Downloaded image is empty');

            let fileType = response.headers.get('content-type') || blob.type;
            if (!fileType || fileType === 'application/octet-stream') {
                const urlLower = imageUrl.toLowerCase();
                if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) fileType = 'image/jpeg';
                else if (urlLower.includes('.png')) fileType = 'image/png';
                else if (urlLower.includes('.webp')) fileType = 'image/webp';
                else fileType = 'image/jpeg';
            }

            const file = new File([blob], `${baseProduct.sku || baseProduct.id}-search.jpg`, { type: fileType });

            const options = {
                top_k: performanceConfig?.apiRequestLimit || 20,
                min_percent: 70
            };
            const results = await searchService.searchByImage(file, options);
            const matched = getMatchedDesignCollections(results || [], allProducts);

            const filteredMatched = matched.filter(p => p.id !== baseProduct.id);

            // Store in cache
            searchCacheRef.current[cacheKey] = filteredMatched;
            setSimilarProducts(filteredMatched);

        } catch (err) {
            console.error('Similar search failed:', err);
            setError(err.message || 'Failed to load similar products.');
            setSimilarProducts([]);
        } finally {
            setLoading(false);
        }
    }, [baseProduct, allProducts, performanceConfig]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={isFullscreen ? false : "lg"}
            fullWidth
            fullScreen={isFullscreen}
            PaperProps={{
                sx: {
                    height: isFullscreen ? '100vh' : '90vh',
                    maxHeight: isFullscreen ? '100vh' : '90vh',
                    borderRadius: isFullscreen ? 0 : 3,
                    m: isFullscreen ? 0 : 2
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {canGoBack && (
                        <IconButton onClick={onBack} size="small" sx={{ mr: 1, border: '1px solid #e0e0e0' }}>
                            <ArrowLeft size={18} />
                        </IconButton>
                    )}
                    <Typography variant="h6" fontWeight="bold">Similar Products</Typography>
                    {baseProduct && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                            <img
                                src={baseProduct.ImgUrl || baseProduct.image}
                                alt="Base"
                                style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'cover' }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                Based on: {baseProduct.designno}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        size="small"
                        sx={{ color: theme => theme.palette.grey[500] }}
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </IconButton>
                    <IconButton onClick={onClose} sx={{ color: theme => theme.palette.grey[500] }}>
                        <X />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3, bgcolor: '#f9f9fa' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography color="text.secondary">Finding visual matches...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
                        <Typography color="error">{error}</Typography>
                        <Button onClick={fetchSimilarProducts} sx={{ mt: 2 }}>Try Again</Button>
                    </Box>
                ) : similarProducts.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
                        <SearchX size={60} color="#9e9e9e" />
                        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>No similar products found</Typography>
                    </Box>
                ) : (
                    <Fade in={showContent} timeout={300}>
                        <Grid container spacing={2}>
                            {similarProducts.map((product, index) => (
                                <Grid
                                    key={`${product.id}-${index}`}
                                    size={{
                                        xs: 6,
                                        sm: 4,
                                        md: 3,
                                        lg: isFullscreen ? 2 : 3,
                                        xl: isFullscreen ? 2 : 3,
                                    }}>
                                    <ProductCard
                                        product={product}
                                        products={similarProducts}
                                        index={index}
                                        onSearchSimilar={onSearchSimilar}
                                        showSimilarButton={true}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>
                )}
            </DialogContent>
        </Dialog >
    );
}

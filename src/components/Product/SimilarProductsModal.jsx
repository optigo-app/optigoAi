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
    Fade,
    Popover
} from '@mui/material';
import { X, SearchX, ArrowLeft, ArrowRight, Minimize, Maximize } from 'lucide-react';
import ProductCard from './ProductCard';
import ImageHoverPreview from '@/components/Common/ImageHoverPreview';
import { searchService } from '@/services/apiService';
import { getMatchedDesignCollections } from '@/utils/globalFunc';

export default function SimilarProductsModal({ open, onClose, baseProduct, allProducts, onSearchSimilar, onBack, onForward, canGoBack, canGoForward }) {
    const [loading, setLoading] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [error, setError] = useState(null);
    const [showContent, setShowContent] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const searchCacheRef = useRef({});

    useEffect(() => {
        if (open && baseProduct) {
            setShowContent(false);

            setTimeout(() => {
                fetchSimilarProducts();
                setShowContent(true);
            }, 50);
        }
    }, [open, baseProduct]);

    const fetchSimilarProducts = useCallback(async () => {
        if (!baseProduct) return;

        const imageUrl = baseProduct.ImgUrl || baseProduct.image;
        if (!imageUrl) {
            setError("No image available for this product.");
            return;
        }
        const cacheKey = baseProduct.id || baseProduct.designno;
        if (searchCacheRef.current[cacheKey]) {
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
            const searchAccuracy = sessionStorage.getItem("searchAccuracy");
            const searchNumResults = sessionStorage.getItem("searchNumResults");
            const options = {
                top_k: searchNumResults || 50,
                min_percent: searchAccuracy || 40
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
    }, [baseProduct, allProducts]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={isFullscreen ? false : "lg"}
            fullWidth
            fullScreen={isFullscreen}
            PaperProps={{
                sx: {
                    height: isFullscreen ? '100%' : 'calc(90vh - 70px)',
                    maxHeight: isFullscreen ? '100%' : 'calc(90vh - 70px)',
                    borderRadius: isFullscreen ? 0 : 3,
                    m: isFullscreen ? 0 : 2
                }
            }}
            sx={{
                '& .MuiDialog-container': {
                    height: isFullscreen ? '100%' : '94%',
                    maxHeight: isFullscreen ? '100%' : '94%'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            onClick={onBack}
                            disabled={!canGoBack}
                            size="small"
                            sx={{
                                border: '1px solid #e0e0e0',
                                opacity: canGoBack ? 1 : 0.3,
                                pointerEvents: canGoBack ? 'auto' : 'none'
                            }}
                        >
                            <ArrowLeft size={18} />
                        </IconButton>
                        <IconButton
                            onClick={onForward}
                            disabled={!canGoForward}
                            size="small"
                            sx={{
                                border: '1px solid #e0e0e0',
                                mr: 1,
                                opacity: canGoForward ? 1 : 0.3,
                                pointerEvents: canGoForward ? 'auto' : 'none'
                            }}
                        >
                            <ArrowRight size={18} />
                        </IconButton>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">Similar Products</Typography>
                    {baseProduct && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                            <ImageHoverPreview
                                imageSrc={baseProduct.ImgUrl || baseProduct.image}
                                altText="Base Large"
                                triggerMode="hover"
                            >
                                <Box
                                    component="img"
                                    src={baseProduct.ImgUrl || baseProduct.image}
                                    alt="Base"
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 1,
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.15)',
                                            boxShadow: 4
                                        }
                                    }}
                                />
                            </ImageHoverPreview>
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
                        sx={{ color: theme => theme.palette.grey[500], padding: 1 }}
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </IconButton>
                    <IconButton onClick={onClose} sx={{ color: theme => theme.palette.grey[500], padding: 1 }}>
                        <X size={20} />
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
        </Dialog>
    );
}

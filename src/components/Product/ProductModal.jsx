'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    CardMedia,
    Box,
    Paper,
    IconButton,
} from '@mui/material';
import { ShoppingCart, X, ChevronLeft, ChevronRight, ScanSearch } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Navigation, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Custom CSS for Swiper to match theme
const swiperStyles = `
  .swiper-pagination-bullet {
    background-color: #7367f0 !important;
    opacity: 0.5 !important;
    width: 10px !important;
    height: 10px !important;
    border-radius: 50% !important;
    transition: all 0.3s ease !important;
  }

  .swiper-pagination-bullet-active {
    background-color: #7367f0 !important;
    opacity: 1 !important;
    width: 12px !important;
    height: 12px !important;
  }

  .swiper-pagination {
    bottom: 20px !important;
  }
`;

export default function ProductModal({ open, onClose, product, products = [], startIndex = 0, onAddToCart, onSearchSimilar }) {
    const [activeIndex, setActiveIndex] = useState(startIndex);
    const { isItemInCart } = useCart();

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = swiperStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    // When modal opens, ensure slider starts from the provided startIndex
    useEffect(() => {
        if (open) {
            setActiveIndex(startIndex);
        }
    }, [open, startIndex]);

    if (!product) return null;

    const sliderProducts = products.length > 0
        ? products.slice(0, 100)
        : Array(100).fill().map((_, i) => ({
            ...product,
            id: `${product.id || 'product'}-${i}`,
            image: product.ImgUrl || product.image || "/images/image-not-found.jpg",
            designno: `${product.designno || 'PROD'}-${i + 1}`
        }));

    const handleSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle sx={{ textAlign: 'start', pb: 1, backgroundColor: '#f5f5f5', position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <X size={20} />
                </IconButton>
                <Typography variant="h5" component="div">
                    Product Details (<span style={{ fontWeight: 600 }}>{sliderProducts[activeIndex]?.designno || product.designno || ''}</span>)
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 0, position: 'relative', minHeight: '500px' }}>
                <Swiper
                    modules={[Virtual, Keyboard, Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    keyboard={{ enabled: true }}
                    virtual={{ enabled: true }}
                    initialSlide={startIndex}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    onSlideChange={handleSlideChange}
                    style={{ width: '100%', height: '100%' }}
                >
                    {sliderProducts.map((prod, index) => (
                        <SwiperSlide key={`${prod.id || 'product'}-${index}`} virtualIndex={index}>
                            <Grid container sx={{ height: '100%', minHeight: '500px' }}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', height: '100%' }}>
                                        <CardMedia
                                            component="img"
                                            image={prod.ImgUrl || prod.image || "/images/image-not-found.jpg"}
                                            alt={prod.categoryname || 'Product image'}
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: 400,
                                                objectFit: 'contain',
                                                borderRadius: 1,
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3, height: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                                        <Paper sx={{ p: 2, flex: 1 }}>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Product Information
                                            </Typography>
                                            <Grid container spacing={1}>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Design No:</Typography>
                                                    <Typography variant="body1">{prod.designno}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Auto Code:</Typography>
                                                    <Typography variant="body1">{prod.autocode}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Category:</Typography>
                                                    <Typography variant="body1">{prod.categoryname}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Subcategory:</Typography>
                                                    <Typography variant="body1">{prod.subcategoryname}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Collection:</Typography>
                                                    <Typography variant="body1">{prod.collectionname}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Brand:</Typography>
                                                    <Typography variant="body1">{prod.brandname}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>

                                        <Paper sx={{ p: 2, flex: 1 }}>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Specifications
                                            </Typography>
                                            <Grid container spacing={1}>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Metal Type:</Typography>
                                                    <Typography variant="body1">{prod.metaltype}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Metal Weight:</Typography>
                                                    <Typography variant="body1">{prod.MetalWeight}g</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Gross Weight:</Typography>
                                                    <Typography variant="body1">{prod.ActualGrossweight}g</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Diamonds:</Typography>
                                                    <Typography variant="body1">{prod.diamondpcs} pcs</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Stones:</Typography>
                                                    <Typography variant="body1">{prod.stonepcs} pcs</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography variant="body2" color="text.secondary">Stone CTW:</Typography>
                                                    <Typography variant="body1">{prod.stonectw} ct</Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Box>
                                </Grid>
                            </Grid>
                        </SwiperSlide>
                    ))}

                    {/* Custom Navigation Buttons */}
                    <IconButton
                        className="swiper-button-prev"
                        sx={{
                            position: 'absolute',
                            left: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            backgroundColor: 'rgba(115, 103, 240, 0.8)',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(115, 103, 240, 0.9)',
                            },
                            transition: 'all 0.3s ease',
                            width: 40,
                            height: 40
                        }}
                    >
                        <ChevronLeft size={24} />
                    </IconButton>

                    <IconButton
                        className="swiper-button-next"
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            backgroundColor: 'rgba(115, 103, 240, 0.8)',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(115, 103, 240, 0.9)',
                            },
                            transition: 'all 0.3s ease',
                            width: 40,
                            height: 40
                        }}
                    >
                        <ChevronRight size={24} />
                    </IconButton>
                </Swiper>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: onSearchSimilar && (sliderProducts[activeIndex]?.ImgUrl || sliderProducts[activeIndex]?.image) ? 'space-between' : 'flex-end', backgroundColor: '#fcfcfcff' }}>
                {onSearchSimilar && (sliderProducts[activeIndex]?.ImgUrl || sliderProducts[activeIndex]?.image) && (
                    <Button
                        variant="outlined"
                        startIcon={<ScanSearch size={18} />}
                        onClick={() => {
                            onSearchSimilar(sliderProducts[activeIndex] || product);
                            onClose();
                        }}
                        sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                                borderColor: 'primary.dark',
                                backgroundColor: 'rgba(115, 103, 240, 0.1)',
                            },
                        }}
                    >
                        Search Similar
                    </Button>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{
                        fontWeight: 500,
                        position: 'absolute',
                        bottom: 25,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(141, 141, 141, 0.5)',
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        zIndex: 10,
                    }}>
                        {activeIndex + 1} / {sliderProducts.length}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ShoppingCart size={18} />}
                        onClick={() => {
                            const currentProduct = sliderProducts[activeIndex] || product;
                            if (!isItemInCart(currentProduct.id)) {
                                onAddToCart(currentProduct);
                            }
                        }}
                        disabled={isItemInCart((sliderProducts[activeIndex] || product)?.id)}
                    >
                        {isItemInCart((sliderProducts[activeIndex] || product)?.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
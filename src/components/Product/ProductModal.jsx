'use client';

import React, { useState, useEffect, useRef } from 'react';
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

import { ShoppingCart, X, ChevronLeft, ChevronRight, ScanSearch, Trash2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Navigation, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ReusableConfirmModal from '../Common/ReusableConfirmModal';
import { isFrontendFeRoute } from '@/utils/urlUtils';

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

const MagnifierImage = ({ src, alt }) => {
    const imgRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [lens, setLens] = useState({ x: 0, y: 0, bgX: '0%', bgY: '0%' });

    const LENS_SIZE = 140;
    const ZOOM = 2.6;

    const handleMove = (e) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            setIsHovering(false);
            return;
        }

        const half = LENS_SIZE / 2;
        const clampedX = Math.max(half, Math.min(x, rect.width - half));
        const clampedY = Math.max(half, Math.min(y, rect.height - half));

        const xPercent = (clampedX / rect.width) * 100;
        const yPercent = (clampedY / rect.height) * 100;

        setLens({
            x: clampedX,
            y: clampedY,
            bgX: `${xPercent}%`,
            bgY: `${yPercent}%`,
        });
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
                maxHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'zoom-in',
                userSelect: 'none',
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMove}
        >
            <Box
                ref={imgRef}
                component="img"
                src={src}
                alt={alt}
                draggable={false}
                sx={{
                    width: '100%',
                    height: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                }}
                onDragStart={(e) => e.preventDefault()}
            />

            <Box
                sx={{
                    position: 'absolute',
                    left: lens.x - LENS_SIZE / 2,
                    top: lens.y - LENS_SIZE / 2,
                    width: LENS_SIZE,
                    height: LENS_SIZE,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                    backgroundImage: `url(${src})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `${lens.bgX} ${lens.bgY}`,
                    backgroundSize: `${ZOOM * 100}%`,
                    pointerEvents: 'none',
                    opacity: isHovering ? 1 : 0,
                    transform: isHovering ? 'scale(1)' : 'scale(0.96)',
                    transition: 'opacity 160ms ease, transform 160ms ease',
                }}
            />
        </Box>
    );
};

export default function ProductModal({ open, onClose, product, products = [], startIndex = 0, onAddToCart, onSearchSimilar, fromCart, urlParamsFlag }) {
    const [activeIndex, setActiveIndex] = useState(startIndex);
    const { isItemInCart, removeFromCart } = useCart();
    const [openConfirmModal, setOpenConfirmModal] = useState(false);

    const softPrimaryButtonSx = {
        textTransform: 'none',
        boxShadow: 'none',
        borderRadius: 2,
        borderColor: 'transparent',
        bgcolor: 'rgba(115, 103, 240, 0.08)',
        color: 'primary.dark',
        '&:hover': {
            bgcolor: 'rgba(115, 103, 240, 0.12)',
            borderColor: 'transparent',
            boxShadow: 'none',
        },
    };

    const softDangerButtonSx = {
        textTransform: 'none',
        boxShadow: 'none',
        borderRadius: 2,
        borderColor: 'transparent',
        bgcolor: 'rgba(244, 67, 54, 0.08)',
        color: 'error.dark',
        '&:hover': {
            bgcolor: 'rgba(244, 67, 54, 0.12)',
            borderColor: 'transparent',
            boxShadow: 'none',
        },
    };

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
            thumbUrl: product.thumbUrl,
            originalUrl: product.originalUrl,
            image: product.thumbUrl || product.image || "/images/image-not-found.jpg",
            designno: `${product.designno || 'PROD'}-${i + 1}`
        }));

    const handleSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex);
    };

    const handleRemoveItem = () => {
        setOpenConfirmModal(true);
    };

    const handleConfirmRemove = () => {
        const currentProduct = sliderProducts[activeIndex] || product;
        if (currentProduct) {
            removeFromCart(currentProduct.id);
        }
        setOpenConfirmModal(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            sx={{
                height: isFrontendFeRoute() ? '94%' : "100%",
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
                                        {/* <MagnifierImage
                                            src={prod.originalUrl || prod.image || prod.thumbUrl || "/images/image-not-found.jpg"}
                                            alt={prod.categoryname || 'Product image'}
                                        /> */}
                                        <CardMedia
                                            component="img"
                                            image={prod.originalUrl || prod.image || prod.thumbUrl || "/images/image-not-found.jpg"}
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
                        <ChevronLeft size={24} color='white' />
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
                        <ChevronRight size={24} color='white' />
                    </IconButton>
                </Swiper>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: (onSearchSimilar && (sliderProducts[activeIndex]?.originalUrl || sliderProducts[activeIndex]?.image || sliderProducts[activeIndex]?.thumbUrl)) || fromCart ? 'space-between' : 'flex-end', backgroundColor: '#fcfcfcff' }}>
                {onSearchSimilar && (sliderProducts[activeIndex]?.originalUrl || sliderProducts[activeIndex]?.image || sliderProducts[activeIndex]?.thumbUrl) && (
                    <Button
                        variant="outlined"
                        startIcon={<ScanSearch size={18} />}
                        onClick={() => {
                            onSearchSimilar(sliderProducts[activeIndex] || product);
                            onClose();
                        }}
                        sx={softPrimaryButtonSx}
                    >
                        Search Similar
                    </Button>
                )}
                {fromCart && (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Trash2 size={18} />}
                        onClick={handleRemoveItem}
                        sx={softDangerButtonSx}
                    >
                        Remove
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
                        sx={{
                            ...softPrimaryButtonSx,
                            '&.Mui-disabled': {
                                bgcolor: 'rgba(0, 0, 0, 0.06)',
                                color: 'text.disabled',
                            },
                        }}
                    >
                        {isItemInCart((sliderProducts[activeIndex] || product)?.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                </Box>
            </DialogActions>
            <ReusableConfirmModal
                open={openConfirmModal}
                onClose={() => setOpenConfirmModal(false)}
                onConfirm={handleConfirmRemove}
                type="removeItem"
            />
        </Dialog>
    );
}
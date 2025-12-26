"use client";

import React, { useState, useMemo } from 'react';
import {
    Card,
    CardMedia,
    Button,
    Box,
    Skeleton,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';

import { ShoppingCart, ScanSearch, Check } from 'lucide-react';
import ProductModal from './ProductModal';
import { useCart } from '@/context/CartContext';

const ProductCard = React.memo(function ProductCard({
    product,
    products = [],
    index = 0,
    onSearchSimilar,
    showSimilarButton = true,
    urlParamsFlag,
    isMultiSelectMode,
    isSelected,
    onToggleSelection
}) {
    const theme = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const { addToCart, removeFromCart, items: cartItems } = useCart();

    const isInCart = useMemo(() => {
        return cartItems.some(item => item.id === product.id);
    }, [cartItems, product.id]);

    const handleToggleCart = (productToToggle) => {
        if (!productToToggle || !productToToggle.id) return;
        const isProductInCart = cartItems.some(item => item.id === productToToggle.id);
        if (isProductInCart) {
            removeFromCart(productToToggle.id);
        } else {
            addToCart(productToToggle);
        }
    };

    const displayTitle = useMemo(
        () => product?.producttype || product?.type || "",
        [product]
    );

    const displayCategory = useMemo(
        () => product?.categoryname || product?.category || product?.categoryName || "",
        [product]
    );

    const displayDesignNo = useMemo(
        () => product?.designno || "",
        [product]
    );

    const imageSrc = useMemo(() => {
        if (imageError) return "/images/image-not-found.jpg";
        if (product?.thumbUrl) return product.thumbUrl;
        if (product?.image) return product.image;
        return "/images/image-not-found.jpg";
    }, [imageError, product]);

    const hasSimilarSearchImage = useMemo(() => {
        return Boolean(product?.originalUrl || product?.image || product?.thumbUrl);
    }, [product]);



    const handleCardClick = (e) => {
        if (isMultiSelectMode) {
            e.stopPropagation();
            onToggleSelection(product?.id);
        } else {
            setOpenModal(true);
        }
    };


    return (
        <Box
            data-product-id={product?.id}
            data-product-index={index}
            sx={{ position: 'relative', height: '100%', zIndex: 1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card
                onClick={handleCardClick}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: isHovered
                        ? '0 20px 40px rgba(0,0,0,0.05)'
                        : '0 20px 40px rgba(0,0,0,0.01)',
                    height: '100%',
                }}
            >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>

                    {/* IMAGE WRAPPER */}
                    <Box sx={{ width: "100%", pt: "100%", position: "relative" }}>

                        {/* SKELETON SHIMMER */}
                        {!isImageLoaded && !imageError && (
                            <Skeleton
                                variant="rectangular"
                                animation="wave"
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "4px",
                                    bgcolor: 'grey.100'
                                }}
                            />
                        )}

                        {/* REAL IMAGE */}
                        <CardMedia
                            component="img"
                            loading="lazy"
                            image={imageSrc}
                            alt={displayTitle || displayCategory}
                            onLoad={() => setIsImageLoaded(true)}
                            onError={() => {
                                setImageError(true);
                                setIsImageLoaded(true);
                            }}
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                opacity: isImageLoaded ? 1 : 0,
                                transition: "all 0.6s ease-out",
                                transform: isHovered && !isMultiSelectMode ? 'scale(1.08)' : 'scale(1)',
                            }}
                        />
                    </Box>

                    {/* DESIGN NUMBER CHIP - Top Left */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: -5,
                            zIndex: 2,
                            bgcolor: 'rgba(230, 230, 230, 0.2)',
                            color: 'text.secondary',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            pointerEvents: 'none',
                        }}
                    >
                        {displayDesignNo}
                    </Box>

                    {/* CHECKMARK CIRCLE - Multi-Select Mode */}
                    {isMultiSelectMode && (
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelection(product?.id);
                            }}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 3,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: isSelected ? 'primary.main' : 'rgba(255, 255, 255, 0.95)',
                                border: isSelected ? 'none' : '2px solid rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: 'none',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                },
                                '&:active': {
                                    transform: 'scale(0.95)',
                                }
                            }}
                        >
                            {isSelected && (
                                <Check size={18} color="white" strokeWidth={3} />
                            )}
                        </Box>
                    )}

                    {/* IN CART BADGE */}
                    {isInCart && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 28,
                                left: 5,
                                zIndex: 2,
                                bgcolor: 'rgba(115, 103, 240, 0.15)',
                                backdropFilter: 'blur(4px)',
                                color: 'primary.main',
                                p: 0.8,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                boxShadow: '0 2px 8px rgba(115, 103, 240, 0.1)'
                            }}
                        >
                            <ShoppingCart size={14} strokeWidth={2.5} />
                        </Box>
                    )}

                    {/* SEARCH SIMILAR BUTTON */}
                    {showSimilarButton && onSearchSimilar && hasSimilarSearchImage && (
                        <Tooltip title="Search Similar Design" placement="left">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSearchSimilar(product);
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: isMultiSelectMode ? 44 : 8,
                                    right: 8,
                                    color: "#555",
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(4px)',
                                    opacity: isHovered ? 1 : 0,
                                    visibility: isHovered ? 'visible' : 'hidden',
                                    transform: isHovered ? 'translateY(0)' : 'translateY(-10px)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                        color: "#7367f0",
                                        transform: 'scale(1.1)',
                                    },
                                    zIndex: 2
                                }}
                            >
                                <ScanSearch size={18} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* HOVER OVERLAY - Removed gradient, just button slide-up */}
                    {!isMultiSelectMode && (
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenModal(true);
                            }}
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                transform: isHovered ? 'translateY(0)' : 'translateY(102%)',
                                transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<ShoppingCart size={18} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCart(product);
                                }}
                                sx={{
                                    background: isInCart ? theme.gradients?.secondary : theme.gradients?.primary,
                                    color: "white",
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    py: 1.25,
                                    borderRadius: 0,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    textTransform: 'none',
                                    '&:hover': {
                                        background: isInCart ? theme.gradients?.secondary : theme.gradients?.primary,
                                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.1s ease',
                                }}
                            >
                                {isInCart ? "Remove from Cart" : "Add to Cart"}
                            </Button>
                        </Box>
                    )}

                    {/* CLICK OVERLAY FOR MULTI-SELECT */}
                    {isMultiSelectMode && (
                        <Box
                            onClick={handleCardClick}
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                cursor: 'pointer',
                                zIndex: 1,
                                '&:active': {
                                    animation: 'clickPulse 0.3s ease-out',
                                },
                                '@keyframes clickPulse': {
                                    '0%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(0.98)' },
                                    '100%': { transform: 'scale(1)' },
                                },
                            }}
                        />
                    )}
                </Box>
            </Card>

            <ProductModal
                open={openModal}
                onClose={() => { setOpenModal(false); setIsHovered(false) }}
                product={product}
                products={products}
                startIndex={index}
                onAddToCart={handleToggleCart}
                isInCart={isInCart}
                onSearchSimilar={onSearchSimilar}
                urlParamsFlag={urlParamsFlag}
            />
        </Box>
    );
});

export default ProductCard;

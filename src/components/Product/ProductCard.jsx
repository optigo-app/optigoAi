"use client";

import React, { useState, useMemo } from 'react';
import {
    Card,
    CardMedia,
    Button,
    Typography,
    Box,
    Chip,
    Skeleton,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';

import { ShoppingCart, ScanSearch } from 'lucide-react';
import ProductModal from './ProductModal';
import { useCart } from '@/context/CartContext';

const ProductCard = React.memo(function ProductCard({ product, products = [], index = 0, onSearchSimilar, showSimilarButton = true, urlParamsFlag }) {
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


    return (
        <Box
            data-product-id={product?.id}
            data-product-index={index}
            sx={{ position: 'relative', height: '100%', zIndex: 1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isHovered ? 'translateY(-8px)' : 'none',
                    boxShadow: isHovered
                        ? '0 20px 40px rgba(0,0,0,0.12)'
                        : '0 4px 12px rgba(0,0,0,0.03)',
                    height: '100%',
                    bgcolor: '#fff',
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
                                transition: "opacity 0.3s ease",
                            }}
                        />
                    </Box>

                    {/* IN CART BADGE */}
                    {isInCart && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 5,
                                left: 5,
                                zIndex: 2,
                                bgcolor: 'rgba(230, 230, 230, 0.4)',
                                backdropFilter: 'blur(4px)',
                                color: 'text.secondary',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                pointerEvents: 'none',
                            }}
                        >
                            <ShoppingCart size={12} />
                            In Cart
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
                                    top: 8,
                                    right: 8,
                                    color: "#555",
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(4px)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                        color: "#7367f0",
                                    },
                                    zIndex: 2
                                }}
                            >
                                <ScanSearch size={18} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* HOVER OVERLAY */}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            backdropFilter: 'blur(0.2px)',
                            background: 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            p: 2,
                            gap: 1.5,
                            '&:before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: '95px',
                                background: 'linear-gradient(180deg, rgba(115, 103, 240, 0) 0%, rgba(115, 103, 240, 0.55) 100%)',
                                pointerEvents: 'none',
                            },
                            '& > *': {
                                position: 'relative',
                                zIndex: 1,
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenModal(true);
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            {/* <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    textTransform: 'capitalize',
                                    color: 'text.primary',
                                    mb: 0.5,
                                    lineHeight: 1.2,
                                    width: '100%',
                                    textAlign: 'center',
                                    fontSize: { xs: '1rem', md: '1rem', lg: '1rem', xl: '1.25rem' }
                                }}
                            >
                                {displayTitle}
                            </Typography> */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    label={`${displayDesignNo}`}
                                    size="small"
                                    sx={{
                                        backgroundColor: '#fff',
                                        fontWeight: 'bold',
                                        color: '#6b6b6bff',
                                        height: 24,
                                        maxWidth: '100%',
                                        fontSize: { xs: '0.75rem', xl: '0.8125rem' }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', alignItems: 'center' }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<ShoppingCart size={16} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCart(product);
                                }}
                                sx={{
                                    background: isInCart ? theme.gradients?.secondary : theme.gradients?.primary,
                                    color: "white",
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap',
                                    borderRadius: 2,
                                    '&:hover': {
                                        background: isInCart ? theme.gradients?.secondary : theme.gradients?.primary,
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                {isInCart ? "Remove" : "Add to Cart"}
                            </Button>

                        </Box>
                    </Box>
                </Box>

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
            </Card>
        </Box>
    );
});

export default ProductCard;

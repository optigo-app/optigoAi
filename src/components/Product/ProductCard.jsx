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
    Tooltip
} from '@mui/material';

import { ShoppingCart, ScanSearch } from 'lucide-react';
import ProductModal from './ProductModal';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product, products = [], index = 0, onSearchSimilar, showSimilarButton = true }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const { addToCart, removeFromCart, items: cartItems } = useCart();

    const isInCart = useMemo(() => {
        return cartItems.some(item => item.id === product.id);
    }, [cartItems, product.id]);

    const handleToggleCart = (product) => {
        if (!product || !product.id) return;
        if (isInCart) {
            removeFromCart(product.id);
        } else {
            addToCart(product);
        }
    };

    const displayTitle = useMemo(
        () => product?.categoryname || product?.producttype || product?.type || "",
        [product]
    );

    const displayDesignNo = useMemo(
        () => product?.designno || "",
        [product]
    );

    const imageSrc = useMemo(() => {
        if (imageError) return "/images/image-not-found.jpg";
        if (product?.ImgUrl) return product.ImgUrl;
        if (product?.image) return product.image;
        return "/images/image-not-found.jpg";
    }, [imageError, product]);


    return (
        <Box
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
                    boxShadow: isInCart
                        ? '0 0 0 1px #7367f0, 0 12px 24px rgba(115, 103, 240, 0.2)'
                        : isHovered
                            ? '0 20px 40px rgba(0,0,0,0.12)'
                            : '0 4px 12px rgba(0,0,0,0.03)',
                    height: '100%',
                    bgcolor: isInCart ? '#f8f7ff' : '#fff',
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
                            alt={displayTitle}
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
                                objectFit: "cover",
                                opacity: isImageLoaded ? 1 : 0,
                                transition: "opacity 0.3s ease",
                            }}
                        />
                    </Box>

                    {/* CART TICK */}


                    {/* SEARCH SIMILAR BUTTON */}
                    {showSimilarButton && onSearchSimilar && (product?.ImgUrl || product?.image) && (
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
                            backdropFilter: 'blur(2px)',
                            background: 'linear-gradient(135deg, rgba(115, 103, 240, 0.85), rgba(224,224,224,0.85))',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            p: 2,
                            gap: 1.5
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenModal(true);
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h6"
                                sx={{ textTransform: 'capitalize', color: 'white', mb: 0.5, lineHeight: 1.2 }}
                            >
                                {displayTitle}
                            </Typography>
                            <Chip
                                label={`${displayDesignNo}`}
                                size="small"
                                sx={{
                                    backgroundColor: '#fff',
                                    fontWeight: 'bold',
                                    color: '#6b6b6bff',
                                    height: 24
                                }}
                            />
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
                                    backgroundColor: isInCart ? "#f44336" : "#7367f0",
                                    color: "white",
                                    width: '80%',
                                    '&:hover': {
                                        backgroundColor: isInCart ? "#d32f2f" : "#5e56d6",
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
                    onAddToCart={() => handleToggleCart(product)}
                    isInCart={isInCart}
                    onSearchSimilar={onSearchSimilar}
                />
            </Card>
        </Box>
    );
}

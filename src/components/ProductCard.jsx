"use client";

import React, { useState, useMemo } from 'react';
import {
    Card,
    CardMedia,
    Button,
    Typography,
    Box,
    Chip,
    Skeleton
} from '@mui/material';

import { ShoppingCart } from 'lucide-react';
import ProductModal from './ProductModal';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
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
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 18px 30px rgba(0,0,0,0.1)',
                },
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
                                borderRadius: "4px"
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
                            objectFit: "contain",
                            opacity: isImageLoaded ? 1 : 0,
                            transition: "opacity 0.3s ease",
                        }}
                    />
                </Box>

                {/* CART TICK */}
                {isInCart && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: '#4caf50',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                        }}
                    >
                        ✓
                    </Box>
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
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenModal(true);
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ textTransform: 'capitalize', color: 'white', mb: 1 }}
                    >
                        {displayTitle}
                    </Typography>

                    <Chip
                        label={`${displayDesignNo}`}
                        sx={{
                            mb: 2,
                            backgroundColor: '#fff',
                            fontWeight: 'bold',
                            color: '#6b6b6bff'
                        }}
                    />
                    {/* <Typography
                        variant="body2"
                        sx={{
                            color: 'white',
                            textAlign: 'center',
                            mb: 2,
                            opacity: 0.9,

                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {`${product.metaltype ? product.metaltype : ''} ${product.metalcolor || ''
                            } ${product.subcategoryname || ''} ${product.categoryname || ''} ${product.collectionname ? `- ${product.collectionname} Collection` : ''
                            }`.replace(/\s+/g, ' ').trim()}
                    </Typography> */}
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
                            '&:hover': {
                                backgroundColor: isInCart ? "#d32f2f" : "#5e56d6",
                            },
                        }}
                    >
                        {isInCart ? "Remove from Cart" : "Add to Cart"}
                    </Button>
                </Box>
            </Box>

            <ProductModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                product={product}
                onAddToCart={() => handleToggleCart(product)}
                isInCart={isInCart}
            />
        </Card>
    );
}

"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowLeft, ArrowRightCircle, ShoppingCart } from 'lucide-react';

import {
    Container,
    Grid,
    Typography,
    Button,
    IconButton,
    Box,
    Card,
    CardMedia,
    CardContent,
    Skeleton,
} from '@mui/material';
import { useCart } from '@/context/CartContext';

const LucideIconWrapper = ({ Icon, size = 24, ...props }) => (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }} {...props}>
        <Icon size={size} />
    </Box>
);

const CartPageMUI = () => {
    const router = useRouter();

    const { items: cartItems, removeFromCart, clearCart, totalCount, hasHydrated } = useCart();

    const [imageStates, setImageStates] = useState({});

    const handleClearCart = () => {
        clearCart();
    };

    const handleRemoveItem = (id) => {
        removeFromCart(id);
    };

    const handleBack = () => {
        router.push('/product');
    };

    const handleContinue = () => {
        router.push('/checkout');
    };

    const getImageSrc = (item) => {
        const originalSrc = item.ImgUrl || item.image;
        if (!originalSrc || imageStates[item.id]?.error) return "/images/image-not-found.jpg";
        return originalSrc;
    };

    // Loading state
    if (!hasHydrated) {
        return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Container maxWidth="false">
                    <Box sx={{ textAlign: 'center' }}>
                        {/* Loading text with gradient */}
                        <Typography
                            variant="h4"
                            sx={{
                                mt: 2,
                                mb: 3,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 600
                            }}
                        >
                            Loading your cart...
                        </Typography>

                        <Typography variant="body1" color="text.secondary">
                            Please wait while we fetch your items
                        </Typography>

                        {/* Skeleton cards for visual feedback */}
                        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                <Box key={item} sx={{ width: 450 }}>
                                    <Skeleton variant="rectangular" width="100%" height={450} sx={{ borderRadius: 2, mb: 2 }} />
                                    <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
                                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Container maxWidth="false">
                <Box
                    sx={{
                        mb: 2,
                        borderBottom: 1,
                        borderColor: 'grey.200',
                        py: 2,
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Box sx={{ position: 'absolute', left: 0 }}>
                            <IconButton
                                onClick={handleBack}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'text.primary' }
                                }}
                            >
                                <ArrowLeft />
                            </IconButton>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <ShoppingCart size={20} />
                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                >
                                    My Cart ({totalCount})
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {cartItems.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Button
                            onClick={handleClearCart}
                            variant="text"
                            size="small"
                            sx={{
                                textTransform: 'none',
                                textDecoration: 'underline',
                                boxShadow: 'none',
                            }}
                        >
                            Clear Cart
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<ArrowRightCircle size={16} />}
                            onClick={handleContinue}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Continue
                        </Button>
                    </Box>
                )}
                {cartItems.length > 0 ? (
                    <Grid container spacing={3}>
                        {cartItems.map((item, index) => (
                            <Grid
                                key={`${item.id}-${index}`}
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                xl={2}
                                size={{
                                    xs: 6,
                                    sm: 4,
                                    md: 3,
                                    lg: 3,
                                    xl: 2.4,
                                }}
                            >
                                <Card
                                    sx={{
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        },
                                    }}
                                >
                                    {/* Delete Button */}
                                    <IconButton
                                        onClick={() => handleRemoveItem(item.id)}
                                        sx={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 16,
                                            bgcolor: 'white',
                                            boxShadow: 2,
                                            zIndex: 10,
                                            '&:hover': { bgcolor: 'error.main', color: 'error.light' },
                                        }}
                                    >
                                        <LucideIconWrapper Icon={Trash2} size={18} />
                                    </IconButton>
                                    <Box
                                        sx={{
                                            position: "relative",
                                            width: "100%",
                                            pt: "100%", // 1:1 aspect ratio
                                            overflow: "hidden",
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            image={getImageSrc(item)}
                                            alt={item.designno}
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                transition: "transform 0.3s",
                                                "&:hover": { transform: "scale(1.1)" },
                                            }}
                                            onError={() => setImageError(true)}
                                        />
                                    </Box>

                                    {/* Product Details */}
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" align="center" mb={1}>
                                            {item.designno || item.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
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
                            <ShoppingCart size={60} color="#9e9e9e" />
                        </Box>
                        <Typography
                            variant="h5"
                            color="text.primary"
                            fontWeight="medium"
                            sx={{ mb: 2 }}
                        >
                            Your cart is empty
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 4, maxWidth: 400 }}
                        >
                            Looks like you haven't added any items to your cart yet.
                            Start browsing our collection to find something special!
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => router.push('/product')}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}
                        >
                            Browse Products
                        </Button>
                    </Box>
                )}

            </Container>
        </Box>
    );
};

export default CartPageMUI;
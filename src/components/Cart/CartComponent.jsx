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
} from '@mui/material';
import { useCart } from '@/context/CartContext';
import GridBackground from '../Common/GridBackground';
import ReusableConfirmModal from '../Common/ReusableConfirmModal';
import ProductModal from '../Product/ProductModal';
import FullPageLoader from '../FullPageLoader';

const LucideIconWrapper = ({ Icon, size = 24, ...props }) => (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }} {...props}>
        <Icon size={size} />
    </Box>
);

const CartPageMUI = () => {
    const router = useRouter();
    const { items: cartItems, removeFromCart, addToCart, clearCart, totalCount, hasHydrated, loading } = useCart();
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [confirmModalType, setConfirmModalType] = useState(null);
    const [itemToRemove, setItemToRemove] = useState(null);

    const [imageStates, setImageStates] = useState({});

    // Product Modal State
    const [openProductModal, setOpenProductModal] = useState(false);
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);

    const handleClearCart = () => {
        console.log("Clear cart");
        setOpenConfirmModal(true);
        setConfirmModalType('clearCart');
    };

    const handleCloseConfirmModal = () => {
        setOpenConfirmModal(false);
        setConfirmModalType(null);
        setItemToRemove(null);
    };

    const handleConfirmModalConfirm = () => {
        if (confirmModalType === 'clearCart') {
            clearCart();
        } else if (confirmModalType === 'removeItem' && itemToRemove) {
            removeFromCart(itemToRemove);
        }
        setOpenConfirmModal(false);
        setConfirmModalType(null);
        setItemToRemove(null);
    };

    const handleRemoveItem = (id, event) => {
        event.stopPropagation();
        setOpenConfirmModal(true);
        setConfirmModalType('removeItem');
        setItemToRemove(id);
    };

    const handleBack = () => {
        router.push('/product');
    };

    const handleProductClick = (index) => {
        setSelectedProductIndex(index);
        setOpenProductModal(true);
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
                    <FullPageLoader open={hasHydrated} message="Loading..." subtitle="Please wait while we load your cart" />
                </Container>
            </Box>
        );
    }

    return (
        <GridBackground>
            <Container maxWidth="false" sx={{ position: "relative", zIndex: 2, marginBottom: "60px" }}>
                <Box
                    sx={{
                        mb: 1,
                        borderBottom: 1,
                        borderColor: 'grey.200',
                        py: 1,
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
                                color: 'error.main',
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
                    <Grid container spacing={2}>
                        {cartItems.map((item, index) => (
                            <Grid
                                key={`${item.id}-${index}`}
                                size={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 2 }}
                            >
                                <Card
                                    onClick={() => handleProductClick(index)}
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
                                        onClick={(e) => handleRemoveItem(item.id, e)}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: 'white',
                                            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
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
                                            pt: "100%",
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
                                    <CardContent sx={{ pb: '0 !important', padding: '10px !important' }}>
                                        <Typography variant="body2" fontWeight="500" align="center" className='code'>
                                            {item.designno}
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
            <ReusableConfirmModal
                open={openConfirmModal}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmModalConfirm}
                type={confirmModalType} />

            <ProductModal
                open={openProductModal}
                onClose={() => setOpenProductModal(false)}
                product={cartItems[selectedProductIndex]}
                products={cartItems}
                startIndex={selectedProductIndex}
                onAddToCart={addToCart}
                fromCart={true}
            />
        </GridBackground>
    );
};

export default CartPageMUI;
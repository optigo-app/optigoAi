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

import PageHeader from '../Common/PageHeader';

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
            <Container maxWidth="false" sx={{ position: "relative", zIndex: 2, marginBottom: "60px", px: '0 !important' }}>
                <PageHeader
                    centerTitle="My Cart"
                    centerIcon={ShoppingCart}
                    leftContent={
                        <>
                            <IconButton
                                onClick={handleBack}
                                sx={{
                                    color: 'inherit',
                                }}
                            >
                                <ArrowLeft size={20} />
                            </IconButton>
                            {totalCount > 1 && (
                                <Typography variant="body2" sx={{ whiteSpace: 'nowrap', color: 'inherit', opacity: 0.9 }}>
                                    {totalCount} products
                                </Typography>
                            )}
                            {cartItems.length > 0 && (
                                <Button
                                    onClick={handleClearCart}
                                    size="small"
                                    startIcon={<Trash2 size={16} />}
                                    sx={{
                                        textTransform: 'none',
                                        boxShadow: 'none',
                                        borderRadius: 2,
                                        bgcolor: 'rgba(244, 67, 54, 0.08)',
                                        color: 'error.dark',
                                        '&:hover': {
                                            bgcolor: 'rgba(244, 67, 54, 0.12)',
                                            boxShadow: 'none',
                                        },
                                    }}
                                >
                                    Clear cart
                                </Button>
                            )}
                        </>
                    }
                    rightContent={
                        cartItems.length > 0 && (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<ArrowRightCircle size={16} />}
                                onClick={handleContinue}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    borderRadius: 2,
                                }}
                            >
                                Continue
                            </Button>
                        )
                    }
                />


                {cartItems.length > 0 ? (
                    <Grid container spacing={2} sx={{ p: '10px 16px !important', mt: 2 }}>
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
                                            onError={() =>
                                                setImageStates((prev) => ({
                                                    ...prev,
                                                    [item.id]: { ...(prev[item.id] || {}), error: true },
                                                }))
                                            }
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
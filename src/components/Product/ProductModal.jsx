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
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import {
    ShoppingCart,
    X,
    ChevronLeft,
    ChevronRight,
    ScanSearch,
    Trash2,
    Maximize,
    Minimize,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Mousewheel, Navigation, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ReusableConfirmModal from '../Common/ReusableConfirmModal';


export default function ProductModal({ open, onClose, product, products = [], startIndex = 0, onAddToCart, onSearchSimilar, fromCart, urlParamsFlag }) {
    const theme = useTheme()
    const [activeIndex, setActiveIndex] = useState(startIndex);
    const { isItemInCart, removeFromCart } = useCart();
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [swiperRef, setSwiperRef] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const formatWeight = (value) => {
        const n = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(n)) return '0.000';
        return n.toFixed(3);
    };

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

    const sliderButton = {
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: alpha(theme.palette.secondary?.extraLight || theme.palette.secondary.light, 0.1),
        color: 'secondary.dark',
        '&:hover': {
            bgcolor: 'secondary.extraLight',
            borderColor: 'transparent',
            boxShadow: 'none',
        },
    }

    // When modal opens, ensure slider starts from the provided startIndex
    useEffect(() => {
        if (open) {
            setActiveIndex(startIndex);
            if (swiperRef) {
                swiperRef.slideTo(startIndex, 0);
            }
        }
    }, [open, startIndex, swiperRef]);

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

    const currentProd = sliderProducts[activeIndex] || product;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={isFullscreen ? false : "lg"}
            fullWidth
            fullScreen={isFullscreen}
            PaperProps={{
                sx: {
                    height: isFullscreen ? '100%' : 'calc(90vh)',
                    maxHeight: isFullscreen ? '100%' : 'calc(90vh)',
                    borderRadius: isFullscreen ? 0 : 3,
                    pb: isFullscreen ? '50px' : 0,
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
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">
                    Product Details
                </Typography>
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

            <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
                <Swiper
                    modules={[Virtual, Keyboard, Mousewheel]}
                    onSwiper={setSwiperRef}
                    spaceBetween={0}
                    slidesPerView={1}
                    keyboard={{ enabled: true }}
                    mousewheel={{ enabled: true }}
                    virtual={{ enabled: true }}
                    initialSlide={startIndex}
                    onSlideChange={handleSlideChange}
                    style={{ width: '100%', height: '100%' }}
                >
                    {sliderProducts.map((prod, index) => {
                        // Recalculate conditional flags per product
                        const pDiamonds = (prod.diamondpcs > 0) || (prod.diamondweight > 0);
                        const pStones = (prod.stonepcs > 0) || (prod.stoneweight > 0);

                        return (
                            <SwiperSlide key={`${prod.id || 'product'}-${index}`} virtualIndex={index}>
                                <Grid container sx={{ height: '100%' }}>
                                    {/* Image Section - Priority (Cover + No Shadow) */}
                                    <Grid size={{ xs: 12, md: isFullscreen ? 9.5 : 8 }} sx={{ height: { xs: '50%', md: '100%' } }}>
                                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CardMedia
                                                component="img"
                                                image={prod.originalUrl || prod.image || prod.thumbUrl || "/images/image-not-found.jpg"}
                                                alt={prod.categoryname || 'Product image'}
                                                sx={{
                                                    objectFit: isFullscreen ? 'contain' : 'cover',
                                                    borderRadius: 2,
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Details Section - REFINED & CONDITIONAL */}
                                    <Grid size={{ xs: 12, md: isFullscreen ? 2.5 : 4 }} sx={{ height: { xs: '50%', md: '100%' }, overflowY: 'auto', bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

                                            {/* Design Number */}
                                            <Box sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="h5" fontWeight="600" color="#2c2c2c" sx={{ mt: 0.5 }}>
                                                    {prod.designno || "N/A"}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                                                    {[{ value: prod.brandname, isBrand: true }, { value: prod.collectionname }, { value: prod.categoryname }, { value: prod.subcategoryname }, { value: prod.producttype }, { value: prod.stylename }].filter(p => Boolean(p.value)).map((part, idx, arr) => (
                                                        <Box key={`${part.value}-${idx}`} component="span">
                                                            <Box component="span" sx={part.isBrand ? { color: 'text.primary', fontWeight: 700 } : undefined}>
                                                                {part.value}
                                                            </Box>
                                                            {idx < arr.length - 1 ? <Box component="span" sx={{ mx: 0.5 }}>-</Box> : null}
                                                        </Box>
                                                    ))}
                                                </Typography>
                                                {(prod.metaltype || prod.metalpurity || prod.metalcolor) && (
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                        color="secondary.main"
                                                        sx={{
                                                            mt: 1,
                                                            width: 'fit-content',
                                                            maxWidth: '100%',
                                                            bgcolor: 'rgba(115, 103, 240, 0.08)',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 2,
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {[prod.metaltype, prod.metalpurity, prod.metalcolor].filter(Boolean).join(' ')}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Weights */}
                                            <Box>
                                                <Grid container spacing={2}>
                                                    {prod.MetalWeight > 0 && (
                                                        <Grid size={{ xs: 6 }}>
                                                            <Box>
                                                                <Typography variant="caption" display="block" color="text.disabled">Net Weight(Gms)</Typography>
                                                                <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.3rem' }}>{formatWeight(prod.MetalWeight)}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                    {prod.ActualGrossweight > 0 && (
                                                        <Grid size={{ xs: 6 }}>
                                                            <Box>
                                                                <Typography variant="caption" display="block" color="text.disabled">Gross Weight(Gms)</Typography>
                                                                <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.3rem' }}>{formatWeight(prod.ActualGrossweight)}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Box>

                                            {/* Specifications (Conditional) */}
                                            {(pDiamonds || pStones) && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        {pDiamonds && (
                                                            <Box sx={{ border: '1px solid', borderColor: alpha(theme.palette.divider, 0.6), borderRadius: 2, overflow: 'hidden' }}>
                                                                <Box
                                                                    sx={{
                                                                        px: 1.25,
                                                                        py: 0.9,
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                                                                        borderBottom: '1px solid',
                                                                        borderColor: alpha(theme.palette.divider, 0.6),
                                                                    }}
                                                                >
                                                                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                                                                        Diamond
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'right' }}>
                                                                        {[
                                                                            prod.diamondpcs ? `${prod.diamondpcs} pcs` : null,
                                                                            prod.diamondweight ? `${formatWeight(prod.diamondweight)} ct` : null,
                                                                        ].filter(Boolean).join(' • ') || ''}
                                                                    </Typography>
                                                                </Box>
                                                                <TableContainer sx={{ bgcolor: 'background.paper' }}>
                                                                    <Table
                                                                        size="small"
                                                                        sx={{
                                                                            '& .MuiTableCell-root': { py: 0.8, px: 1.1 },
                                                                            '& th': { color: 'text.secondary', fontWeight: 700, bgcolor: alpha(theme.palette.text.primary, 0.03) },
                                                                            '& td': { borderBottom: '1px solid rgba(0,0,0,0.06)' },
                                                                            '& tbody tr:last-child td': { borderBottom: 0 },
                                                                        }}
                                                                    >
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell>Shape</TableCell>
                                                                                <TableCell>Clarity</TableCell>
                                                                                <TableCell>Color</TableCell>
                                                                                <TableCell>Size</TableCell>
                                                                                <TableCell align="right">Pcs</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            <TableRow sx={{ '& td': { color: 'secondary.main', fontWeight: 600 } }}>
                                                                                <TableCell>{prod.diamondshape || '-'}</TableCell>
                                                                                <TableCell>{prod.diamondclarity || prod.clarity || '-'}</TableCell>
                                                                                <TableCell>{prod.diamondcolor || prod.color || '-'}</TableCell>
                                                                                <TableCell>
                                                                                    {prod.diamondsize || (prod.diamondweight ? `${formatWeight(prod.diamondweight)} ct` : '-')}
                                                                                </TableCell>
                                                                                <TableCell align="right">{prod.diamondpcs || 0}</TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>
                                                            </Box>
                                                        )}

                                                        {pStones && (
                                                            <Box sx={{ border: '1px solid', borderColor: alpha(theme.palette.divider, 0.6), borderRadius: 2, overflow: 'hidden' }}>
                                                                <Box
                                                                    sx={{
                                                                        px: 1.25,
                                                                        py: 0.9,
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        bgcolor: alpha(theme.palette.secondary.main, 0.06),
                                                                        borderBottom: '1px solid',
                                                                        borderColor: alpha(theme.palette.divider, 0.6),
                                                                    }}
                                                                >
                                                                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                                                                        Colorstone
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'right' }}>
                                                                        {[
                                                                            prod.stonepcs ? `${prod.stonepcs} pcs` : null,
                                                                            prod.stoneweight ? `${formatWeight(prod.stoneweight)} ct` : null,
                                                                        ].filter(Boolean).join(' • ') || ''}
                                                                    </Typography>
                                                                </Box>
                                                                <TableContainer sx={{ bgcolor: 'background.paper' }}>
                                                                    <Table
                                                                        size="small"
                                                                        sx={{
                                                                            '& .MuiTableCell-root': { py: 0.8, px: 1.1 },
                                                                            '& th': { color: 'text.secondary', fontWeight: 700, bgcolor: alpha(theme.palette.text.primary, 0.03) },
                                                                            '& td': { borderBottom: '1px solid rgba(0,0,0,0.06)' },
                                                                            '& tbody tr:last-child td': { borderBottom: 0 },
                                                                        }}
                                                                    >
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell>Shape</TableCell>
                                                                                <TableCell>Clarity</TableCell>
                                                                                <TableCell>Color</TableCell>
                                                                                <TableCell>Size</TableCell>
                                                                                <TableCell align="right">Pcs</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            <TableRow sx={{ '& td': { color: 'secondary.main', fontWeight: 600 } }}>
                                                                                <TableCell>{prod.stoneshape || prod.stoneshapename || '-'}</TableCell>
                                                                                <TableCell>{prod.stoneclarity || '-'}</TableCell>
                                                                                <TableCell>{prod.stonecolor || '-'}</TableCell>
                                                                                <TableCell>
                                                                                    {prod.stonesize || (prod.stoneweight ? `${formatWeight(prod.stoneweight)} ct` : '-')}
                                                                                </TableCell>
                                                                                <TableCell align="right">{prod.stonepcs || 0}</TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </DialogContent>

            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>

                {/* Left Area: Secondary Actions */}
                <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                    {onSearchSimilar && (currentProd?.originalUrl || currentProd?.image || currentProd?.thumbUrl) && (
                        <Button
                            variant="outlined"
                            startIcon={<ScanSearch size={18} />}
                            onClick={() => {
                                onSearchSimilar(currentProd);
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
                </Box>

                {/* Center Area: Navigation Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'center' }}>
                    <IconButton
                        onClick={() => swiperRef?.slidePrev()}
                        disabled={activeIndex === 0}
                        sx={{
                            ...sliderButton,
                            opacity: activeIndex === 0 ? 0.5 : 1
                        }}
                    >
                        <ChevronLeft size={24} />
                    </IconButton>

                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '60px', textAlign: 'center', color: 'secondary.light' }}>
                        {activeIndex + 1} / {sliderProducts.length}
                    </Typography>

                    <IconButton
                        onClick={() => swiperRef?.slideNext()}
                        disabled={activeIndex === sliderProducts.length - 1}
                        sx={{
                            ...sliderButton,
                            opacity: activeIndex === sliderProducts.length - 1 ? 0.5 : 1
                        }}
                    >
                        <ChevronRight size={24} />
                    </IconButton>
                </Box>

                {/* Right Area: Primary Action */}
                <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={<ShoppingCart size={18} />}
                        onClick={() => {
                            if (!isItemInCart(currentProd.id)) {
                                onAddToCart(currentProd);
                            }
                        }}
                        disabled={isItemInCart(currentProd?.id)}
                        sx={{
                            ...softPrimaryButtonSx,
                            bgcolor: isItemInCart(currentProd?.id) ? 'action.disabledBackground' : 'primary.main',
                            color: isItemInCart(currentProd?.id) ? 'text.disabled' : 'common.white',
                            '&:hover': {
                                bgcolor: isItemInCart(currentProd?.id) ? 'action.disabledBackground' : 'primary.dark',
                            }
                        }}
                    >
                        {isItemInCart(currentProd?.id) ? 'In Cart' : 'Add to Cart'}
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
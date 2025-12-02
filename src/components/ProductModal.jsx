'use client';

import React from 'react';
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
import { ShoppingCart, X } from 'lucide-react';

export default function ProductModal({ open, onClose, product, onAddToCart, isInCart }) {
    if (!product) return null;

    const imageSrc = product.ImgUrl || product.image || "/images/image-not-found.jpg";

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
                    Product Details (<span style={{ fontWeight: 600 }}>{product.designno || ''}</span>)
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Grid container>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                            <CardMedia
                                component="img"
                                image={imageSrc}
                                alt={product.categoryname}
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: 400,
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Product Information
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Design No:</Typography>
                                        <Typography variant="body1">{product.designno}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Auto Code:</Typography>
                                        <Typography variant="body1">{product.autocode}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Category:</Typography>
                                        <Typography variant="body1">{product.categoryname}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Subcategory:</Typography>
                                        <Typography variant="body1">{product.subcategoryname}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Collection:</Typography>
                                        <Typography variant="body1">{product.collectionname}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Brand:</Typography>
                                        <Typography variant="body1">{product.brandname}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Specifications
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Metal Type:</Typography>
                                        <Typography variant="body1">{product.metaltype}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Metal Weight:</Typography>
                                        <Typography variant="body1">{product.MetalWeight}g</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Gross Weight:</Typography>
                                        <Typography variant="body1">{product.ActualGrossweight}g</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Diamonds:</Typography>
                                        <Typography variant="body1">{product.diamondpcs} pcs</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Stones:</Typography>
                                        <Typography variant="body1">{product.stonepcs} pcs</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Stone CTW:</Typography>
                                        <Typography variant="body1">{product.stonectw} ct</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: 'flex-end', backgroundColor: '#f5f5f5' }}>
                <Button
                    variant="contained"
                    startIcon={<ShoppingCart size={18} />}
                    onClick={() => {
                        if (!isInCart) onAddToCart(product);
                        onClose();
                    }}
                    disabled={isInCart}
                >
                    {isInCart ? 'In Cart' : 'Add to Cart'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
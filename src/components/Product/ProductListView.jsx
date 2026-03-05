"use client";
import React, { useMemo } from "react";
import {
    Box,
    Chip,
    IconButton,
    Tooltip,
    Typography,
    Avatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ShoppingCart, Eye, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useMultiSelect } from "@/context/MultiSelectContext";

const ProductListView = ({ 
    designData, 
    onSearchSimilar, 
    loading,
    restoreTargetIndex 
}) => {
    const { addToCart, removeFromCart, items: cartItems } = useCart();
    const { isMultiSelectMode, isProductSelected, toggleProductSelection } = useMultiSelect();

    const isInCart = (productId) => {
        return cartItems.some(item => item.id === productId);
    };

    const handleCartToggle = (product, e) => {
        e.stopPropagation();
        if (isInCart(product.id)) {
            removeFromCart(product.id);
        } else {
            addToCart(product);
        }
    };

    const getPaymentStatus = (product) => {
        // Mock logic - you can customize based on your data
        const statuses = ['Pending', 'Success'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const getFulfillmentStatus = (product) => {
        // Mock logic - you can customize based on your data
        const statuses = ['Unfulfilled', 'Fulfilled'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const columns = useMemo(() => [
        {
            field: 'id',
            headerName: 'Sr#',
            width: 80,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.row._index + 1}
                </Typography>
            ),
        },
        {
            field: 'designno',
            headerName: 'Design#',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'collectionname',
            headerName: 'Collection',
            width: 150,
            renderCell: (params) => params.value || 'N/A',
        },
        {
            field: 'categoryname',
            headerName: 'Category',
            width: 130,
        },
        {
            field: 'subcategoryname',
            headerName: 'Sub Category',
            width: 140,
            renderCell: (params) => params.value || 'N/A',
        },
        {
            field: 'producttype',
            headerName: 'Product Type',
            width: 150,
            renderCell: (params) => params.value || 'N/A',
        },
        {
            field: 'brandname',
            headerName: 'Brand',
            width: 120,
            renderCell: (params) => params.value || 'N/A',
        },
        {
            field: 'ActualGrossweight',
            headerName: 'Act Gross Wt',
            width: 120,
            type: 'number',
            renderCell: (params) => (
                <Typography variant="body2">
                    {params.value ? `${params.value}g` : 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'metaltype',
            headerName: 'Metal',
            width: 130,
            renderCell: (params) => params.value || 'N/A',
        },
        {
            field: 'metalcolor',
            headerName: 'Metal Color',
            width: 120,
            renderCell: (params) => params.value || 'N/A',
        },
        {
            field: 'diamondshape',
            headerName: 'Dia. Shape',
            width: 120,
            renderCell: (params) => params.value || 'N/A',
        },
        {
            field: 'diamondctw',
            headerName: 'Dia. Ctw.',
            width: 100,
            type: 'number',
            renderCell: (params) => {
                // Calculate from diamondpcs if diamondctw doesn't exist
                const ctw = params.value || (params.row.diamondpcs ? params.row.diamondpcs * 0.01 : 0);
                return (
                    <Typography variant="body2">
                        {ctw ? ctw.toFixed(2) : 'N/A'}
                    </Typography>
                );
            },
        },
        {
            field: 'diamondpcs',
            headerName: 'Dia. Pcs.',
            width: 100,
            type: 'number',
            renderCell: (params) => params.value || 0,
        },
        {
            field: 'stonectw',
            headerName: 'C.S. Ctw.',
            width: 100,
            type: 'number',
            renderCell: (params) => {
                const ctw = params.value || 0;
                return (
                    <Typography variant="body2">
                        {ctw ? ctw.toFixed(2) : 'N/A'}
                    </Typography>
                );
            },
        },
        {
            field: 'stonepcs',
            headerName: 'C.S. PCS',
            width: 100,
            type: 'number',
            renderCell: (params) => params.value || 0,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const inCart = isInCart(params.row.id);
                return (
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title={inCart ? "Remove from cart" : "Add to cart"}>
                            <IconButton
                                size="small"
                                onClick={(e) => handleCartToggle(params.row, e)}
                                sx={{
                                    color: inCart ? 'primary.main' : 'text.secondary',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <ShoppingCart size={18} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Search similar">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSearchSimilar(params.row);
                                }}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Search size={18} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="View details">
                            <IconButton
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Eye size={18} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        },
    ], [cartItems]);

    const rows = useMemo(() => {
        return designData.map((product, index) => ({
            ...product,
            _index: index, // Store original index for restore target
        }));
    }, [designData]);

    if (!designData || designData.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Typography color="text.secondary">No products found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                checkboxSelection
                disableRowSelectionOnClick
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 25, page: 0 },
                    },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-row:hover': {
                        bgcolor: 'action.hover',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,
                        fontSize: '0.875rem',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: '2px solid',
                        borderColor: 'divider',
                    },
                    '& .MuiCheckbox-root': {
                        color: 'primary.main',
                    },
                    // Sticky Actions column
                    '& .MuiDataGrid-cell[data-field="actions"]': {
                        position: 'sticky',
                        right: 0,
                        bgcolor: 'background.paper',
                        zIndex: 1,
                        boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.08)',
                    },
                    '& .MuiDataGrid-columnHeader[data-field="actions"]': {
                        position: 'sticky',
                        right: 0,
                        bgcolor: 'grey.50',
                        zIndex: 2,
                        boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.08)',
                    },
                    '& .MuiDataGrid-row:hover .MuiDataGrid-cell[data-field="actions"]': {
                        bgcolor: 'action.hover',
                    },
                }}
                getRowClassName={(params) => {
                    return params.row._index === restoreTargetIndex ? 'restore-target-row' : '';
                }}
            />
        </Box>
    );
};

export default ProductListView;

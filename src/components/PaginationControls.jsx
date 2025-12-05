'use client';
import React from 'react';
import { Pagination, Box, PaginationItem, Select, MenuItem, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    disabled = false,
    itemsPerPage = 100,
    onItemsPerPageChange,
}) {
    if (totalPages <= 1 && !onItemsPerPageChange) {
        return null;
    }

    const handleChange = (event, value) => {
        onPageChange(value);
    };

    const handleItemsPerPageChange = (event) => {
        if (onItemsPerPageChange) {
            onItemsPerPageChange(event.target.value);
        }
    };

    const rowsPerPageOptions = [10, 25, 50, 100];

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Rows per page selector */}
            {onItemsPerPageChange && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                        Rows per page:
                    </Typography>
                    <Select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        size="small"
                        disabled={disabled}
                        sx={{
                            minWidth: 70,
                            '& .MuiSelect-select': {
                                py: 0.5,
                                fontSize: 14,
                                fontWeight: 600,
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'text.primary',
                            },
                        }}
                    >
                        {rowsPerPageOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handleChange}
                    disabled={disabled}
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    siblingCount={1}
                    boundaryCount={1}
                    size="medium"
                    renderItem={(item) => (
                        <PaginationItem
                            slots={{
                                first: ChevronsLeft,
                                last: ChevronsRight,
                                previous: ChevronLeft,
                                next: ChevronRight,
                            }}
                            {...item}
                        />
                    )}
                    sx={{
                        '& .MuiPaginationItem-root': {
                            typography: 'body2',
                            fontWeight: 600,
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'text.primary',
                                transform: 'translateY(-1px)',
                            },
                            '&.Mui-selected': {
                                bgcolor: 'text.primary',
                                color: 'background.paper',
                                borderColor: 'text.primary',
                                '&:hover': {
                                    bgcolor: 'text.primary',
                                },
                            },
                            '&.Mui-disabled': {
                                opacity: 0.5,
                                bgcolor: 'action.disabledBackground',
                            },
                        },
                        '& .MuiPaginationItem-ellipsis': {
                            border: 'none',
                            bgcolor: 'transparent',
                            '&:hover': {
                                bgcolor: 'transparent',
                                transform: 'none',
                                borderColor: 'transparent',
                            },
                        },
                    }}
                />
            )}
        </Box>
    );
}

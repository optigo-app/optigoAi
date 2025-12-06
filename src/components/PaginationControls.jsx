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
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        Rows per page:
                    </Typography>
                    <Select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        size="small"
                        disabled={disabled}
                        sx={{
                            minWidth: 60,
                            '& .MuiSelect-select': {
                                py: 0.5,
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: 'text.secondary',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'transparent',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
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
                    size="small"
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
                            typography: 'caption',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'transparent',
                            bgcolor: 'transparent',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'divider',
                            },
                            '&.Mui-selected': {
                                bgcolor: 'action.selected',
                                color: 'primary.main',
                                fontWeight: 600,
                                borderColor: 'transparent',
                                '&:hover': {
                                    bgcolor: 'action.selected',
                                },
                            },
                            '&.Mui-disabled': {
                                opacity: 0.3,
                            },
                        },
                        '& .MuiPaginationItem-ellipsis': {
                            border: 'none',
                            bgcolor: 'transparent',
                            '&:hover': {
                                bgcolor: 'transparent',
                                borderColor: 'transparent',
                            },
                        },
                    }}
                />
            )}
        </Box>
    );
}

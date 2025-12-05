'use client';
import React from 'react';
import { Pagination, Box, PaginationItem } from '@mui/material';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function PaginationControls({ currentPage, totalPages, onPageChange, disabled = false }) {
    if (totalPages <= 1) {
        return null;
    }

    const handleChange = (event, value) => {
        onPageChange(value);
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
        </Box>
    );
}

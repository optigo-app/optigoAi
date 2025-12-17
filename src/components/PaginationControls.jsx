'use client';
import React, { useEffect, useState } from 'react';
import { Pagination, Box, PaginationItem, Select, MenuItem, Typography, TextField, Divider } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    disabled = false,
    itemsPerPage = 100,
    onItemsPerPageChange,
}) {
    const [goToValue, setGoToValue] = useState(String(currentPage || 1));

    useEffect(() => {
        setGoToValue(String(currentPage || 1));
    }, [currentPage]);

    useEffect(() => {
        setGoToValue((prev) => {
            const parsed = parseInt(prev, 10);
            if (!Number.isFinite(parsed)) return String(currentPage || 1);
            const clamped = Math.min(Math.max(parsed, 1), totalPages || 1);
            return String(clamped);
        });
    }, [totalPages, currentPage]);
    
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

    const clampPage = (value) => {
        const parsed = parseInt(String(value), 10);
        if (!Number.isFinite(parsed)) return currentPage || 1;
        const maxPage = totalPages || 1;
        return Math.min(Math.max(parsed, 1), maxPage);
    };

    const commitGoTo = () => {
        const clamped = clampPage(goToValue);
        setGoToValue(String(clamped));
        if (!disabled && clamped !== currentPage) {
            onPageChange(clamped);
        }
    };

    const rowsPerPageOptions = [10, 25, 50, 100];

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
                width: '100%'
            }}
        >
            {/* Rows per page selector */}
            {/* {onItemsPerPageChange && (
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
            )} */}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handleChange}
                        disabled={disabled}
                        shape="rounded"
                        siblingCount={1}
                        boundaryCount={1}
                        size="large"
                        renderItem={(item) => (
                            <PaginationItem
                                slots={{
                                    previous: ChevronLeft,
                                    next: ChevronRight,
                                }}
                                {...item}
                            />
                        )}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                typography: 'caption',
                                fontSize: '1rem',
                                fontWeight: 500,
                                borderRadius: 2,
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
                                    bgcolor: 'text.primary',
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderColor: 'transparent',
                                    '&:hover': {
                                        bgcolor: 'text.primary',
                                    },
                                },
                                '&.Mui-disabled': {
                                    opacity: 0.3,
                                },
                            },
                            '& .MuiPaginationItem-previousNext': {
                                borderRadius: '50%',
                                minWidth: 40,
                                height: 40,
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

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 0.5,
                            opacity: 1,
                            color: 'divider',
                            width: '2px',
                            bgcolor: 'divider'
                        }}
                    />


                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Go to page:
                        </Typography>
                        <TextField
                            value={goToValue}
                            disabled={disabled}
                            onChange={(e) => {
                                const next = e.target.value;
                                if (next === '') {
                                    setGoToValue('');
                                    return;
                                }
                                if (/^\d+$/.test(next)) {
                                    setGoToValue(next);
                                }
                            }}
                            onBlur={commitGoTo}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    commitGoTo();
                                    e.currentTarget.blur();
                                }
                            }}
                            size="small"
                            placeholder="1"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center' } }}
                            sx={{
                                width: 90,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Box,
    Button,
    Typography,
    Fade,
    Chip,
    IconButton,
    Badge,
    Tooltip,
} from "@mui/material";
import { ShoppingCart, ChevronLeft, ChevronRight, CheckSquare, Square, X as XIcon } from "lucide-react";
import Image from "next/image";
import PageHeader from "@/components/Common/PageHeader";
import FilterChips from "@/components/Product/FilterChips";

export default function ProductPageHeader({
    // Multi-select props
    isMultiSelectMode,
    selectedCount,
    isAllSelected,
    onCancelMultiSelect,
    onSelectAllToggle,
    onBulkAddToCart,
    onToggleMultiSelectMode,

    // Navigation/Cart props
    onHomeClick,
    onOpenCart,
    totalCartItems,

    // Filter/Search props
    productCount,
    appliedFilters,
    searchTerm,
    onRemoveFilter,
    onClearSearchTerm,
    onClearAllFilters,
    onFilterPopoverOpen,
    isFilterOpen // New prop
}) {
    // Filter Chips Scroll State
    const filterScrollRef = useRef(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);
    const [isClearAllInside, setIsClearAllInside] = useState(true);

    const checkScrollButtons = useCallback(() => {
        if (filterScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = filterScrollRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
            const hasOverflow = scrollWidth > clientWidth + 2;
            setIsClearAllInside(!hasOverflow);
        }
    }, []);

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);
        const transitionTimer = setTimeout(() => {
            checkScrollButtons();
        }, 450);

        return () => {
            window.removeEventListener('resize', checkScrollButtons);
            clearTimeout(transitionTimer);
        };
    }, [checkScrollButtons, appliedFilters, searchTerm, isFilterOpen]);

    const scrollFilters = (direction) => {
        if (filterScrollRef.current) {
            const scrollAmount = 400;
            filterScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScrollButtons, 300);
        }
    };

    return (
        <PageHeader
            layout="fluid"
            leftContent={
                isMultiSelectMode ? (
                    <IconButton
                        onClick={onCancelMultiSelect}
                        sx={{
                            bgcolor: 'rgba(244, 67, 54, 0.08)',
                            color: '#f44336',
                            borderRadius: '50%',
                            p: 1,
                            '&:hover': {
                                bgcolor: 'rgba(244, 67, 54, 0.15)',
                                transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <XIcon size={20} />
                    </IconButton>
                ) : (
                    <>
                        <Image
                            src="/favicon.svg"
                            alt="Hero Image"
                            width={35}
                            height={35}
                            priority
                            draggable={false}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '50%',
                                cursor: 'pointer',
                            }}
                            onClick={onHomeClick}
                            onDragStart={(e) => e.preventDefault()}
                        />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                Magic Catalog / AI
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                {productCount} products found
                            </Typography>
                        </Box>
                    </>
                )
            }
            centerContent={
                isMultiSelectMode ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={800}
                            sx={{
                                color: 'primary.main',
                                bgcolor: 'rgba(115, 103, 240, 0.1)',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '20px',
                                fontSize: '0.9rem'
                            }}
                        >
                            {selectedCount} Items Selected
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%", // Take full available width in the center slot
                        minWidth: 0,
                        position: "relative"
                    }}>
                        <Fade in={showLeftScroll}>
                            <IconButton
                                size="small"
                                onClick={() => scrollFilters('left')}
                                sx={{
                                    p: 0.5,
                                    mr: 0.5,
                                    flexShrink: 0,
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <ChevronLeft size={16} />
                            </IconButton>
                        </Fade>

                        <Box
                            className="filterScrollBox"
                            ref={filterScrollRef}
                            onScroll={checkScrollButtons}
                            sx={{
                                display: "flex",
                                gap: 1,
                                overflowX: "auto",
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": { display: "none" },
                                alignItems: "center",
                                flex: 1,
                                scrollBehavior: "smooth",
                                p: 0.5,
                            }}
                        >
                            {searchTerm && (
                                <Chip
                                    key="drawer-search"
                                    label={`Search: ${searchTerm}`}
                                    size="small"
                                    onDelete={onClearSearchTerm}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: 'rgba(115, 103, 240, 0.08)',
                                        color: 'primary.dark',
                                        border: '1px solid rgba(115, 103, 240, 0.18)',
                                        flexShrink: 0,
                                        '&:hover': {
                                            bgcolor: 'rgba(115, 103, 240, 0.12)',
                                        },
                                        '& .MuiChip-deleteIcon': {
                                            color: 'primary.dark',
                                            opacity: 0.8,
                                            '&:hover': { opacity: 1 }
                                        }
                                    }}
                                />
                            )}
                            <FilterChips
                                appliedFilters={appliedFilters}
                                onRemoveFilter={onRemoveFilter}
                                onFilterPopoverOpen={onFilterPopoverOpen}
                            />

                            {appliedFilters.length > 0 && isClearAllInside && (
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={onClearAllFilters}
                                    sx={{
                                        textTransform: "none",
                                        fontSize: 12.5,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        color: 'text.primary',
                                        border: '1px solid rgba(0, 0, 0, 0.10)',
                                        whiteSpace: "nowrap",
                                        minWidth: "auto",
                                        flexShrink: 0,
                                        padding: '0px 10px',
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.06)',
                                            borderColor: 'rgba(0, 0, 0, 0.12)'
                                        }
                                    }}
                                >
                                    Clear All
                                </Button>
                            )}
                        </Box>

                        <Fade in={showRightScroll}>
                            <IconButton
                                size="small"
                                onClick={() => scrollFilters('right')}
                                sx={{
                                    p: 0.5,
                                    ml: 0.5,
                                    flexShrink: 0,
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <ChevronRight size={16} />
                            </IconButton>
                        </Fade>

                        {appliedFilters.length > 0 && !isClearAllInside && (
                            <Button
                                variant="text"
                                size="small"
                                onClick={onClearAllFilters}
                                sx={{
                                    textTransform: "none",
                                    fontSize: 13,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                                    color: 'text.primary',
                                    border: '1px solid rgba(0, 0, 0, 0.10)',
                                    whiteSpace: "nowrap",
                                    minWidth: "auto",
                                    flexShrink: 0,
                                    ml: 1,
                                    padding: '0px 10px',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.06)',
                                        borderColor: 'rgba(0, 0, 0, 0.12)'
                                    }
                                }}
                            >
                                Clear All
                            </Button>
                        )}
                    </Box>
                )
            }
            rightContent={
                isMultiSelectMode ? (
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Tooltip title={isAllSelected ? "Deselect All" : "Select All"}>
                            <IconButton
                                onClick={onSelectAllToggle}
                                sx={{
                                    color: isAllSelected ? 'primary.main' : 'text.secondary',
                                    borderRadius: '50%',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: isAllSelected ? 'rgba(115, 103, 240, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                {isAllSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant="contained"
                            startIcon={<ShoppingCart size={18} />}
                            onClick={onBulkAddToCart}
                            disabled={selectedCount === 0}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                fontWeight: 600,
                                px: 2.5,
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: 'none',
                                }
                            }}
                        >
                            Add to Cart
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title="Enter Multi-Select">
                            <IconButton
                                onClick={onToggleMultiSelectMode}
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: "50%",
                                    color: isMultiSelectMode ? "primary.main" : "text.secondary",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        bgcolor: isMultiSelectMode
                                            ? "rgba(115,103,240,0.22)"
                                            : "rgba(0,0,0,0.08)",
                                        transform: "scale(1.06)"
                                    }
                                }}
                            >
                                {isMultiSelectMode ? (
                                    <CheckSquare size={20} strokeWidth={2.2} />
                                ) : (
                                    <Square size={20} strokeWidth={2} />
                                )}
                            </IconButton>
                        </Tooltip>
                        <IconButton
                            color="primary"
                            onClick={onOpenCart}
                        >
                            <Badge
                                badgeContent={totalCartItems}
                                color="primary"
                                max={99}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        fontSize: 12,
                                        minWidth: 22,
                                        height: 22,
                                        lineHeight: '22px',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    },
                                }}
                            >
                                <ShoppingCart size={25} />
                            </Badge>
                        </IconButton>
                    </Box>
                )
            }
        />
    );
}

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
} from "@mui/material";
import { ShoppingCart, ChevronLeft, ChevronRight, CheckSquare, Square, X as XIcon, Filter } from "lucide-react";
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
    onBulkRemoveFromCart,
    isRemovalMode,
    newItemsCount,

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
    isFilterOpen, // New prop
    searchMode,
    onFilterClick
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
            sx={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                // ...(isMultiSelectMode ? {
                //     bgcolor: 'rgba(115, 103, 240, 0.08)',
                //     borderBottom: '1px solid rgba(115, 103, 240, 0.15)',
                //     boxShadow: '0 4px 20px rgba(115, 103, 240, 0.08)',
                // } : {})
            }}
            leftContent={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                    <Box sx={{
                        transition: 'opacity 0.2s ease',
                        opacity: isMultiSelectMode ? 0.6 : 1
                    }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {isMultiSelectMode ? 'Selection Mode' : 'Magic Catalog / AI'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                {isMultiSelectMode ? `${selectedCount} items selected` : `${productCount} products found`}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            }
            centerContent={
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    minWidth: 0,
                    position: "relative",
                    transition: 'all 0.3s ease',
                    opacity: isMultiSelectMode ? 0.5 : 1,
                    pointerEvents: isMultiSelectMode ? 'none' : 'auto',
                    filter: isMultiSelectMode ? 'blur(1px)' : 'none'
                }}>
                    <Fade in={showLeftScroll && !isMultiSelectMode}>
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

                    <Fade in={showRightScroll && !isMultiSelectMode}>
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
                </Box>
            }
            rightContent={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {(searchMode === 'ai' && !isMultiSelectMode) && (
                        <Fade in={true}>
                            <Button
                                variant="contained"
                                startIcon={<Filter size={16} />}
                                size="small"
                                className="more-filter-btn"
                                onClick={onFilterClick}
                                sx={{ mr: 1 }}
                            >
                                More Filters
                            </Button>
                            {/* <Tooltip title="Filters">
                                <IconButton
                                    size="small"
                                    onClick={onFilterClick}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: 'rgba(115, 103, 240, 0.08)',
                                        color: 'primary.main',
                                        borderRadius: '50%',
                                        '&:hover': {
                                            bgcolor: 'rgba(115, 103, 240, 0.15)',
                                        }
                                    }}
                                >
                                    <Filter size={20} />
                                </IconButton>
                            </Tooltip> */}
                        </Fade>
                    )}
                    {isMultiSelectMode ? (
                        <>
                            <Button
                                onClick={onSelectAllToggle}
                                startIcon={isAllSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    color: isAllSelected ? 'primary.main' : 'text.primary',
                                    px: 2,
                                    '&:hover': { bgcolor: isAllSelected ? 'rgba(115, 103, 240, 0.08)' : 'rgba(0, 0, 0, 0.04)' }
                                }}
                            >
                                {isAllSelected ? "Deselect All" : "Select All"}
                            </Button>

                            <Button
                                variant="contained"
                                color={isRemovalMode ? "error" : "primary"}
                                startIcon={isRemovalMode ? <XIcon size={18} /> : <ShoppingCart size={18} />}
                                onClick={isRemovalMode ? onBulkRemoveFromCart : onBulkAddToCart}
                                disabled={selectedCount === 0 || (!isRemovalMode && newItemsCount === 0)}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    px: 2.5,
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none' }
                                }}
                            >
                                {isRemovalMode ? 'Remove' : 'Add to Cart'} ({selectedCount})
                            </Button>

                            <Button
                                onClick={onCancelMultiSelect}
                                color="error"
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    px: 2,
                                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.08)' }
                                }}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={onToggleMultiSelectMode}
                                startIcon={<Square size={18} />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    fontWeight: 500,
                                    color: "primary.main",
                                    bgcolor: "rgba(115, 103, 240, 0.12)",
                                    px: 2,
                                    py: 0.6,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        bgcolor: "rgba(115, 103, 240, 0.2)",
                                        transform: "translateY(-1px)"
                                    }
                                }}
                            >
                                Select
                            </Button>
                            <IconButton color="primary" onClick={onOpenCart}>
                                <Badge
                                    badgeContent={totalCartItems}
                                    color="primary"
                                    max={99}
                                    sx={{ '& .MuiBadge-badge': { fontSize: 11, fontWeight: 700 } }}
                                >
                                    <ShoppingCart size={22} />
                                </Badge>
                            </IconButton>
                        </>
                    )}
                </Box>
            }
        />
    );
}

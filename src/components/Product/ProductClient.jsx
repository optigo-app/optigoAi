"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Container,
    Box,
    Button,
    Typography,
    Fade,
    Popover,
    Chip,
    IconButton,
    Badge,
    Tooltip,
} from "@mui/material";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import productsData from "@/data/Product.json";
import ModernSearchBar from "@/components/ModernSearchBar";
import ScrollToTop from "@/components/ScrollToTop";
import FullPageLoader from "@/components/FullPageLoader";
import FilterSidebar from "@/components/Product/FilterSidebar";
import PaginationControls from "@/components/PaginationControls";
import { searchService } from "@/services/apiService";
import Fuse from "fuse.js";
import FilterChips from "@/components/Product/FilterChips";
import { base64ToFile } from "@/utils/globalFunc";
import ProductGrid from "./ProductGrid";
import SimilarProductsModal from "./SimilarProductsModal";
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useProductData } from '@/context/ProductDataContext';
import GridBackground from "@/components/Common/GridBackground";
import { isFrontendFeRoute } from "@/utils/urlUtils";
import Image from "next/image";
import PageHeader from "@/components/Common/PageHeader";

const CATEGORY_FIELD_MAP = {
    'category': 'categoryname',
    'subcategory': 'subcategoryname',
    'collection': 'collectionname',
    'product type': 'producttype',
    'type': 'producttype',
    'brand': 'brandname',
    'gender': 'gendername',
    'style': 'stylename',
    'ocassion': 'occassionname',
    'lab': 'labname',
    'metal color': 'metalcolor',
    'metal': 'metaltype',
    'metal type': 'metaltype',
    'diamond shape': 'diamondshape',
    'shape': 'diamondshape',
    'design#': 'designno',
    'designno': 'designno'
};

export default function ProductClient() {
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isFilterLoading, setIsFilterLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { totalCount } = useCart();
    const router = useRouter();

    // Use product data context
    const { productData: allDesignCollections, isLoading: isLoadingProducts, fetchProductData } = useProductData();
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const [appliedFilters, setAppliedFilters] = useState([]);
    const [urlParamsFlag, setUrlParamsFlag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Similar Product Search State
    const [similarProductHistory, setSimilarProductHistory] = useState([]);
    const [similarProductCurrentIndex, setSimilarProductCurrentIndex] = useState(-1);
    const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false);

    // Filter Popover State
    const [anchorElFilter, setAnchorElFilter] = useState(null);
    const [filterPopoverItems, setFilterPopoverItems] = useState([]);

    // Filter Chips Scroll State
    const filterScrollRef = React.useRef(null);
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

    useEffect(() => {
        const flag = sessionStorage.getItem("urlParams");
        setUrlParamsFlag(flag);
    }, []);

    const handleFilterPopoverOpen = (event, items) => {
        setAnchorElFilter(event.currentTarget);
        setFilterPopoverItems(items);
    };

    const handleFilterPopoverClose = () => {
        setAnchorElFilter(null);
        setFilterPopoverItems([]);
    };

    const handleSearchSimilar = useCallback((product) => {
        setSimilarProductHistory(prev => {
            const newHistory = prev.slice(0, similarProductCurrentIndex + 1);
            return [...newHistory, product];
        });
        setSimilarProductCurrentIndex(prev => prev + 1);
        setIsSimilarModalOpen(true);
    }, [similarProductCurrentIndex]);

    const handleSimilarModalClose = useCallback(() => {
        setIsSimilarModalOpen(false);
        setSimilarProductHistory([]);
        setSimilarProductCurrentIndex(-1);
    }, []);

    const handleSimilarBack = useCallback(() => {
        setSimilarProductCurrentIndex(prev => Math.max(0, prev - 1));
    }, []);

    const handleSimilarForward = useCallback(() => {
        setSimilarProductCurrentIndex(prev => Math.min(similarProductHistory.length - 1, prev + 1));
    }, [similarProductHistory.length]);

    const currentSimilarProduct = similarProductHistory[similarProductCurrentIndex] || null;

    useEffect(() => {
        const encoded = sessionStorage.getItem("homeSearchData");
        if (encoded && allDesignCollections.length > 0) {
            try {
                const jsonString = decodeURIComponent(escape(atob(encoded)));
                const searchData = JSON.parse(jsonString);
                const now = Date.now();
                const dataAge = now - (searchData.timestamp || 0);
                const fiveMinutes = 5 * 60 * 1000;

                if (dataAge < fiveMinutes) {
                    if (searchData.image && typeof searchData.image === "string" && searchData.image.startsWith("data:")) {
                        searchData.image = base64ToFile(searchData.image, "uploaded-image.png");
                    }
                    handleSubmit(searchData);
                    if (Array.isArray(searchData.filters) && searchData.filters.length > 0) {
                        setAppliedFilters(searchData.filters);
                    }
                    sessionStorage.removeItem('homeSearchData');
                }

            } catch (error) {
                console.error('Error processing stored search data:', error);
                sessionStorage.removeItem('homeSearchData');
            }
        }
    }, [allDesignCollections]);

    // Debounce search term for better performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);


    const [searchResults, setSearchResults] = useState(null);
    const [lastSearchData, setLastSearchData] = useState(null);

    // Items per page with sessionStorage persistence (guarded for SSR)
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('productsPerPage');
            return saved ? parseInt(saved, 10) : 100;
        }
        return 100;
    });

    // Save itemsPerPage to sessionStorage
    useEffect(() => {
        sessionStorage.setItem('productsPerPage', itemsPerPage.toString());
    }, [itemsPerPage]);

    const handleItemsPerPageChange = useCallback((newValue) => {
        setItemsPerPage(newValue);
        setCurrentPage(1);
    }, []);

    const baseDataset = useMemo(() => {
        return searchResults !== null ? searchResults : (allDesignCollections || []);
    }, [searchResults, allDesignCollections]);

    const finalFilteredProducts = useMemo(() => {
        let temp = baseDataset;
        // Apply drawer filters (exclude search chips)
        const drawerFilters = appliedFilters.filter(
            (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
        );
        if (drawerFilters.length > 0) {
            const filtersByCategory = drawerFilters.reduce((acc, { category, item }) => {
                if (!acc[category]) acc[category] = [];
                acc[category].push(item);
                return acc;
            }, {});

            temp = temp.filter((product) => {
                return Object.entries(filtersByCategory).every(([category, items]) => {
                    return items.some((item) => {
                        const categoryLower = category.toLowerCase();
                        let productKey = CATEGORY_FIELD_MAP[categoryLower];

                        // Fallback: try to find a partial match if exact match fails
                        if (!productKey) {
                            const match = Object.keys(CATEGORY_FIELD_MAP).find(key => categoryLower.includes(key));
                            if (match) productKey = CATEGORY_FIELD_MAP[match];
                        }

                        const fieldValue = productKey ? product[productKey] : "";
                        const fieldValueLower = (fieldValue || "").toLowerCase();
                        const itemNameLower = (item.name || "").toLowerCase();

                        return (
                            fieldValueLower === itemNameLower ||
                            product.MasterManagement_DiamondStoneTypeid === item.id
                        );
                    });
                });
            });
        }

        // Apply search filter (only for terms with 2+ characters)
        if (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 2) {
            const fuse = new Fuse(temp, {
                keys: [
                    'autocode', 'designno', 'categoryname', 'subcategoryname',
                    'collectionname', 'producttype', 'brandname', 'labname',
                    'metaltype', 'metalcolor', 'diamondshape'
                ],
                threshold: 0.6,
                distance: 1000,
                minMatchCharLength: 2,
                ignoreLocation: true,
                useExtendedSearch: false,
            });
            const results = fuse.search(debouncedSearchTerm.trim());
            temp = results.map(result => result.item);
        }

        return temp;
    }, [baseDataset, appliedFilters, debouncedSearchTerm]);

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(finalFilteredProducts.length / itemsPerPage);
    }, [finalFilteredProducts.length, itemsPerPage]);

    // Get current page products (optimized for large datasets)
    const displayedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return finalFilteredProducts.slice(startIndex, endIndex);
    }, [finalFilteredProducts, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [finalFilteredProducts]);

    const handleApplyFilters = useCallback((applied) => {
        setIsFilterLoading(true);
        const searchFilters = appliedFilters.filter(
            (f) => f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id)
        );

        const drawerFilters = applied.filter(
            (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
        );

        const allAppliedFilters = [...searchFilters, ...drawerFilters];

        // Artificial delay to show loading state
        setTimeout(() => {
            setAppliedFilters(allAppliedFilters);
            setIsFilterLoading(false);
        }, 800);
    }, [appliedFilters]);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const removeFilter = useCallback(
        ({ item }) => {
            const newApplied = appliedFilters.filter((f) => f.item.id !== item.id);
            if (item && ["text-search", "image-search", "hybrid-search"].includes(item.id)) {
                setSearchResults(null);
                setError(null);
            }
            setAppliedFilters(newApplied);
        },
        [appliedFilters]
    );

    const clearAllFilters = useCallback(() => {
        setAppliedFilters([]);
        setSearchResults(null);
        setSearchTerm('');
        setError(null);
    }, []);

    const handleSuggestionClick = useCallback((suggestion) => {
        if (!suggestion || !suggestion.value) return;
        const newFilter = {
            category: suggestion.filterCategory || 'Search',
            item: {
                id: suggestion.id || suggestion.value,
                name: suggestion.name || suggestion.label || suggestion.value,
                value: suggestion.value
            }
        };
        setAppliedFilters(prev => {
            const exists = prev.some(f =>
                f.category === newFilter.category &&
                f.item.value === newFilter.item.value
            );
            if (exists) return prev;
            return [...prev, newFilter];
        });
    }, []);

    const handlePageChange = useCallback((page) => {
        setIsTransitioning(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
            setCurrentPage(page);
            setIsTransitioning(false);
        }, 100);
    }, []);

    function getMatchedDesignCollections(res = [], allDesignCollections = []) {
        if (!Array.isArray(res) || !Array.isArray(allDesignCollections)) return [];
        const designMatchMap = {};
        for (const item of res) {
            const base = (item.sku || "").split("~")[0].trim().toLowerCase();
            const percent = Number(item.match_percent) || 0;
            if (!designMatchMap[base] || designMatchMap[base] < percent) {
                designMatchMap[base] = percent;
            }
        }
        const matched = allDesignCollections
            .map((p) => {
                const designno = (p.designno || "").replace("#", "").trim().toLowerCase();
                const autocode = (p.autocode || "").trim().toLowerCase();

                const matchPercent = designMatchMap[designno] || designMatchMap[autocode] || 0;

                return {
                    ...p,
                    _matchPercent: matchPercent,
                };
            })
            .filter((p) => p._matchPercent > 0);

        matched.sort((a, b) => b._matchPercent - a._matchPercent);

        return matched.map((p) => {
            const { _matchPercent, ...rest } = p;
            return rest;
        });
    }

    const handleSubmit = useCallback(async (searchData) => {
        if (!searchData?.isSearchFlag || searchData.isSearchFlag === 0) {
            console.log('No search criteria provided, showing all products');
            return;
        }
        setLastSearchData(searchData);
        setError(null);
        setIsSearchLoading(true);
        try {
            const options = {
                top_k: searchData?.numResults || "10",
                min_percent: searchData?.accuracy || "50.0",
            };

            const res = await (async () => {
                if (searchData?.isSearchFlag === 1) {
                    return searchService.searchByText(searchData.text?.trim(), options);
                }
                if (searchData?.isSearchFlag === 2) {
                    return searchService.searchByImage(searchData.image, options);
                }
                if (searchData?.isSearchFlag === 3) {
                    return searchService.searchHybrid(
                        { file: searchData.image, query: searchData.text?.trim() },
                        options
                    );
                }
            })();

            if (!res || !Array.isArray(res)) {
                setSearchResults([]);
                setAppliedFilters((prev) =>
                    prev.filter(
                        (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
                    )
                );
                return;
            }

            const sortedMatchedDesigns = getMatchedDesignCollections(res, allDesignCollections || []);

            // Store search results - drawer filters will be applied on top
            setSearchResults(sortedMatchedDesigns);

            let searchChip = null;
            if (searchData?.isSearchFlag === 1) {
                searchChip = {
                    category: "Text",
                    item: { id: "text-search", name: searchData.text?.trim() || "" },
                };
            } else if (searchData?.isSearchFlag === 2) {
                const imageUrl = searchData.image ? URL.createObjectURL(searchData.image) : null;
                searchChip = {
                    category: "Image",
                    item: {
                        id: "image-search",
                        name: "Image Search",
                        icon: true,
                        imageUrl: imageUrl
                    },
                };
            } else if (searchData?.isSearchFlag === 3) {
                const imageUrl = searchData.image ? URL.createObjectURL(searchData.image) : null;
                searchChip = {
                    category: "Hybrid",
                    item: {
                        id: "hybrid-search",
                        name: searchData.text?.trim() || "Hybrid Search",
                        imageUrl: imageUrl,
                        text: searchData.text?.trim()
                    },
                };
            }

            if (searchChip) {
                setAppliedFilters((prev) => [
                    searchChip,
                    ...prev.filter(
                        (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
                    ),
                ]);
            }
        } catch (err) {
            console.error("Search Error:", err);
            setError("Search failed. Try again.");
            setSearchResults([]);

            // Create error chip to show failed search
            let errorChip = null;
            if (searchData?.isSearchFlag === 1) {
                errorChip = {
                    category: "Text",
                    item: {
                        id: "text-search",
                        name: searchData.text?.trim() || "",
                        error: true
                    },
                };
            } else if (searchData?.isSearchFlag === 2) {
                const imageUrl = searchData.image ? URL.createObjectURL(searchData.image) : null;
                errorChip = {
                    category: "Image",
                    item: {
                        id: "image-search",
                        name: "Image Search",
                        icon: true,
                        imageUrl: imageUrl,
                        error: true
                    },
                };
            } else if (searchData?.isSearchFlag === 3) {
                const imageUrl = searchData.image ? URL.createObjectURL(searchData.image) : null;
                errorChip = {
                    category: "Hybrid",
                    item: {
                        id: "hybrid-search",
                        name: searchData.text?.trim() || "Hybrid Search",
                        imageUrl: imageUrl,
                        text: searchData.text?.trim(),
                        error: true
                    },
                };
            }

            if (errorChip) {
                setAppliedFilters((prev) => [
                    errorChip,
                    ...prev.filter(
                        (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
                    ),
                ]);
            }
        } finally {
            setIsSearchLoading(false);
        }
    }, [allDesignCollections]);

    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            try {
                await fetchProductData();
            } catch (err) {
                console.error(err);
                if (mounted) setError("Failed to load products");
            }
        };
        loadData();
        return () => {
            mounted = false;
        };
    }, [fetchProductData]);

    const loading = isLoadingProducts;
    if (loading) return <FullPageLoader open={true} />;

    return (
        <GridBackground>
            <Container maxWidth={false} sx={{ px: 0, pb: 50, position: "relative", zIndex: 2, pl: { xs: 2, md: isFilterOpen ? '340px' : 0 }, transition: 'padding-left 0.4s cubic-bezier(0.86, 0, 0.07, 1)' }} disableGutters>
                <PageHeader
                    layout="fluid"
                    leftContent={
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
                                onClick={() => router.push('/')}
                                onDragStart={(e) => e.preventDefault()}
                            />
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                    Magic Catalog / AI
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                    {finalFilteredProducts.length} products found
                                </Typography>
                            </Box>
                        </>
                    }
                    centerContent={
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
                                        onDelete={() => setSearchTerm('')}
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
                                    onRemoveFilter={removeFilter}
                                    onFilterPopoverOpen={handleFilterPopoverOpen}
                                />

                                {appliedFilters.length > 0 && isClearAllInside && (
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={clearAllFilters}
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
                                    onClick={clearAllFilters}
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
                    }
                    rightContent={
                        <IconButton
                            color="primary"
                            onClick={() => router.push('/cart')}
                        >
                            <Badge
                                badgeContent={totalCount}
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
                    }
                />

                {error ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '50vh',
                            textAlign: 'center',
                            px: 2,
                        }}
                    >
                        <Typography variant="h5" color="error" gutterBottom>
                            {error}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => lastSearchData && handleSubmit(lastSearchData)}
                            disabled={!lastSearchData}
                            sx={{ mt: 2 }}
                        >
                            Retry Search
                        </Button>
                    </Box>
                ) : (
                    <Fade in={!isTransitioning} timeout={200}>
                        <Box sx={{ p: '10px 16px !important', mt: 2 }}>
                            <ProductGrid
                                products={productsData}
                                designData={displayedProducts}
                                appliedFilters={appliedFilters}
                                clearAllFilters={clearAllFilters}
                                onSearchSimilar={handleSearchSimilar}
                                loading={isFilterLoading}
                                isFilterOpen={isFilterOpen}
                            />
                        </Box>
                    </Fade>
                )}

                {/* Bottom Pagination */}
                {!error && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12, mb: 2 }}>
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </Box>
                )}
            </Container >

            <Box className="modernSearchInputBox" sx={{
                position: "fixed",
                bottom: isFrontendFeRoute() ? 120 : 50,
                left: { xs: 0, md: isFilterOpen ? '320px' : 0 },
                right: 0,
                p: 2,
                zIndex: 1000,
                transition: 'left 0.4s cubic-bezier(0.86, 0, 0.07, 1)'
            }}>
                <Box sx={{ maxWidth: 650, width: "100%", mx: "auto" }}>
                    <ModernSearchBar
                        onSubmit={handleSubmit}
                        onFilterClick={() => setIsFilterOpen(true)}
                        appliedFilters={appliedFilters}
                        onApply={handleApplyFilters}
                        initialExpanded={true}
                        suggestionPosition="top"
                        showSuggestions={true}
                        productData={allDesignCollections}
                        onSuggestionClick={handleSuggestionClick}
                    />
                </Box>
                <ScrollToTop bottom={isFrontendFeRoute() ? 70 : 24} />
            </Box>

            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={handleApplyFilters}
                appliedFilters={appliedFilters}
                onSearch={handleSearch}
                currentSearchTerm={searchTerm}
                urlParamsFlag={urlParamsFlag}
            />



            {/* Filter Details Popover */}
            <Popover
                open={Boolean(anchorElFilter)}
                anchorEl={anchorElFilter}
                onClose={handleFilterPopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        p: 2,
                        width: 320,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                    Active Filters
                </Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1,
                    maxHeight: 200,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#e0e0e0',
                        borderRadius: '3px',
                    }
                }}>
                    {filterPopoverItems.map(({ category, item }) => {
                        const isLong = item.name.length > 15;
                        const label = isLong ? `${item.name.substring(0, 12)}...` : item.name;

                        return (
                            <Tooltip title={item.name} key={item.id} placement="top" disableHoverListener={!isLong}>
                                <Chip
                                    label={label}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        color: 'text.primary',
                                        border: '1px solid rgba(0, 0, 0, 0.10)',
                                        maxWidth: '100%',
                                        "&.MuiButtonBase-root": {
                                            display: 'flex !important',
                                            justifyContent: 'space-between !important'
                                        },
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.06)',
                                        },
                                        '& .MuiChip-deleteIcon': {
                                            color: 'text.secondary',
                                            opacity: 0.8,
                                            '&:hover': { opacity: 1 }
                                        }
                                    }}
                                    onDelete={() => {
                                        removeFilter({ item });
                                        if (filterPopoverItems.length <= 2) {
                                            handleFilterPopoverClose();
                                        } else {
                                            setFilterPopoverItems(prev => prev.filter(i => i.item.id !== item.id));
                                        }
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                </Box>
            </Popover>

            {/* Similar Products Modal */}
            <SimilarProductsModal
                open={isSimilarModalOpen}
                onClose={handleSimilarModalClose}
                baseProduct={currentSimilarProduct}
                allProducts={allDesignCollections}
                onSearchSimilar={handleSearchSimilar}
                onBack={handleSimilarBack}
                onForward={handleSimilarForward}
                canGoBack={similarProductCurrentIndex > 0}
                canGoForward={similarProductCurrentIndex < similarProductHistory.length - 1}
            />

            <FullPageLoader
                open={isSearchLoading}
                message="Searching designs..."
                subtitle={
                    lastSearchData?.text?.trim()
                        ? `Finding matches for "${lastSearchData.text.trim()}"`
                        : "Analyzing your design and matching collections"
                }
            />
        </GridBackground >
    );
}

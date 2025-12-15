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
import { ShoppingCart, ArrowLeft } from "lucide-react";
import productsData from "@/data/Product.json";
import ModernSearchBar from "@/components/ModernSearchBar";
import ScrollToTop from "@/components/ScrollToTop";
import FullPageLoader from "@/components/FullPageLoader";
import FilterDrawer from "@/components/Product/FilterDrawer";
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

export default function ProductClient() {
    const [isSearchLoading, setIsSearchLoading] = useState(false);
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

    // Similar Product Search State
    const [similarProductHistory, setSimilarProductHistory] = useState([]);
    const [similarProductCurrentIndex, setSimilarProductCurrentIndex] = useState(-1);
    const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false);

    // Filter Popover State
    const [anchorElFilter, setAnchorElFilter] = useState(null);
    const [filterPopoverItems, setFilterPopoverItems] = useState([]);

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
                    console.log("Decoded searchData:", searchData);
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

                        // Optimized field mapping
                        const fieldMap = {
                            'category': product.categoryname,
                            'subcategory': product.subcategoryname,
                            'sub category': product.subcategoryname,
                            'collection': product.collectionname,
                            'product type': product.producttype,
                            'type': product.producttype,
                            'brand': product.brandname,
                            'lab': product.labname,
                            'metal color': product.metalcolor,
                            'metal': product.metaltype,
                            'diamond shape': product.diamondshape,
                            'shape': product.diamondshape,
                            'design#': product.designno,
                            'designno': product.designno,
                        };

                        // Find matching field
                        let fieldValue = "";
                        for (const [key, value] of Object.entries(fieldMap)) {
                            if (categoryLower.includes(key)) {
                                fieldValue = value;
                                break;
                            }
                        }

                        // Fallback if no match
                        // if (!fieldValue) {
                        //     fieldValue = product.categoryname || product.collectionname || product.metaltype;
                        // }

                        // Case-insensitive partial matching
                        const fieldValueLower = (fieldValue || "").toLowerCase();
                        const itemNameLower = (item.name || "").toLowerCase();

                        return (
                            fieldValueLower.includes(itemNameLower) ||
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
        // Preserve existing search filters and combine with new drawer filters
        const searchFilters = appliedFilters.filter(
            (f) => f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id)
        );

        // Separate drawer filters from the applied filters
        const drawerFilters = applied.filter(
            (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
        );

        // Combine search filters with drawer filters
        const allAppliedFilters = [...searchFilters, ...drawerFilters];
        setAppliedFilters(allAppliedFilters);
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
        // Verify suggestion has necessary data
        if (!suggestion || !suggestion.value) return;

        // Add as a filter
        const newFilter = {
            category: suggestion.filterCategory || 'Search',
            item: {
                id: suggestion.id || suggestion.value,
                name: suggestion.name || suggestion.label || suggestion.value,
                value: suggestion.value
            }
        };

        // Check if already exists to prevent duplicates
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

    // Use context loading state instead of local loading
    const loading = isLoadingProducts;

    if (loading) return <FullPageLoader open={true} />;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "#f8f9fa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "linear-gradient(rgba(115, 103, 240, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(115, 103, 240, 0.03) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    width: "100%",
                    height: "100%",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            />
            {/* Center Glow */}
            <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "70vw",
                height: "70vw",
                opacity: 0.5,
                background: "radial-gradient(circle, rgba(115,103,240,0.18) 0%, transparent 60%)",
                filter: "blur(100px)",
                zIndex: 0
            }} />


            <Container maxWidth={false} sx={{ px: 2, pb: 12, position: "relative", zIndex: 2 }} disableGutters>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                        pt: 1,

                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <IconButton
                            onClick={() => router.push('/')}
                            sx={{ color: 'text.primary' }}
                        >
                            <ArrowLeft size={24} />
                        </IconButton>
                        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                            {finalFilteredProducts.length} products
                        </Typography>
                        {searchTerm && (
                            <Chip
                                key="drawer-search"
                                label={`Search: ${searchTerm}`}
                                size="small"
                                onDelete={() => setSearchTerm('')}
                                sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}
                            />
                        )}
                        <FilterChips
                            appliedFilters={appliedFilters}
                            onRemoveFilter={removeFilter}
                            onFilterPopoverOpen={handleFilterPopoverOpen}
                        />

                        {appliedFilters.length > 0 && (
                            <Button
                                variant="text"
                                size="small"
                                onClick={clearAllFilters}
                                sx={{ textTransform: "none", fontSize: 14, textDecoration: "underline", color: "text.primary" }}
                            >
                                Clear All
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                        <IconButton
                            color="primary"
                            onClick={() => router.push('/cart')}
                            sx={{
                                bgcolor: 'rgba(115, 103, 240, 0.1)',
                                '&:hover': {
                                    bgcolor: 'rgba(115, 103, 240, 0.2)',
                                }
                            }}
                        >
                            <Badge badgeContent={totalCount} color="primary" max={99}>
                                <ShoppingCart size={22} />
                            </Badge>
                        </IconButton>
                    </Box>
                </Box>

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
                        <Box>
                            <ProductGrid
                                products={productsData}
                                designData={displayedProducts}
                                appliedFilters={appliedFilters}
                                clearAllFilters={clearAllFilters}
                                onSearchSimilar={handleSearchSimilar}
                            />
                        </Box>
                    </Fade>
                )}
            </Container >

            <Box className="modernSearchInputBox" sx={{
                position: "fixed",
                bottom: urlParamsFlag && urlParamsFlag?.toLowerCase() === 'fe' ? 120 : 50,
                left: 0,
                right: 0,
                p: 2,
                zIndex: 1000
            }}>
                <Box sx={{ maxWidth: 650, width: "100%", mx: "auto" }}>
                    <ModernSearchBar
                        onSubmit={handleSubmit}
                        onFilterClick={() => setIsFilterOpen(true)}
                        appliedFilters={appliedFilters}
                        onApply={handleApplyFilters}
                        alwaysExpanded={true}
                        suggestionPosition="top"
                        showSuggestions={true}
                        productData={allDesignCollections}
                        onSuggestionClick={handleSuggestionClick}
                    />
                </Box>
                <ScrollToTop bottom={urlParamsFlag && urlParamsFlag?.toLowerCase() === 'fe' ? 70 : 24} />
            </Box>

            <FilterDrawer
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
                                        maxWidth: '100%',
                                        "&.MuiButtonBase-root": {
                                            display: 'flex !important',
                                            justifyContent: 'space-between !important'
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
        </Box>
    );
}

"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
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
} from "@mui/material";
import { Maximize2, Filter, ShoppingCart, ArrowLeft } from "lucide-react";
import ImageViewerModal from "@/components/Common/ImageViewerModal";
import productsData from "@/data/Product.json";
import ModernSearchBar from "@/components/ModernSearchBar";
import ScrollToTop from "@/components/ScrollToTop";
import FullPageLoader from "@/components/FullPageLoader";
import FilterDrawer from "@/components/Product/FilterDrawer";
import PaginationControls from "@/components/PaginationControls";
import { designCollectionApi } from "@/app/api/designCollectionApi";
import { searchService } from "@/services/apiService";
import Fuse from "fuse.js";
import FilterChips from "@/components/Product/FilterChips";
import { base64ToFile } from "@/utils/globalFunc";
import ProductGrid from "./ProductGrid";
import SimilarProductsModal from "./SimilarProductsModal";
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductClient() {
    const [loading, setLoading] = useState(true);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { totalCount } = useCart();
    const router = useRouter();

    const [allDesignCollections, setAllDesignCollections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const [appliedFilters, setAppliedFilters] = useState([]);
    const [urlParamsFlag, setUrlParamsFlag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Image Preview State
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState(null);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [viewerImage, setViewerImage] = useState(null);

    // Similar Product Search State
    // Similar Product Search State
    const [similarProductHistory, setSimilarProductHistory] = useState([]);
    const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false);

    // Filter Popover State
    const [anchorElFilter, setAnchorElFilter] = useState(null);
    const [filterPopoverItems, setFilterPopoverItems] = useState([]);

    const handlePopoverOpen = (event, content) => {
        setAnchorEl(event.currentTarget);
        setPopoverContent(content);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setPopoverContent(null);
    };

    const handleFilterPopoverOpen = (event, items) => {
        setAnchorElFilter(event.currentTarget);
        setFilterPopoverItems(items);
    };

    const handleFilterPopoverClose = () => {
        setAnchorElFilter(null);
        setFilterPopoverItems([]);
    };

    const handleImageClick = (imageUrl) => {
        setViewerImage(imageUrl);
        setIsImageViewerOpen(true);
        handlePopoverClose();
    };

    const handleSearchSimilar = useCallback((product) => {
        setSimilarProductHistory(prev => [...prev, product]);
        setIsSimilarModalOpen(true);
    }, []);

    const handleSimilarModalClose = useCallback(() => {
        setIsSimilarModalOpen(false);
        setSimilarProductHistory([]);
    }, []);

    const handleSimilarBack = useCallback(() => {
        setSimilarProductHistory(prev => {
            if (prev.length <= 1) return prev;
            return prev.slice(0, -1);
        });
    }, []);

    const currentSimilarProduct = similarProductHistory.length > 0
        ? similarProductHistory[similarProductHistory.length - 1]
        : null;

    useEffect(() => {
        const flag = sessionStorage.getItem("urlParams");
        setUrlParamsFlag(flag);
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

    // Import GradientWaves dynamically
    const GradientWaves = useMemo(() => dynamic(
        () => import("@/components/animation/GradientWaves").then((mod) => mod.GradientWaves),
        { ssr: false }
    ), []);


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
        return searchResults !== null ? searchResults : allDesignCollections;
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
                        let fieldValue = "";
                        if (category.toLowerCase().includes("collection")) {
                            fieldValue = product.collectionname;
                        } else if (category.toLowerCase().includes("metal")) {
                            fieldValue = product.metaltype;
                        } else if (category.toLowerCase().includes("category")) {
                            fieldValue = product.categoryname;
                        } else if (category.toLowerCase().includes("brand")) {
                            fieldValue = product.brandname;
                        } else {
                            fieldValue =
                                product.categoryname || product.collectionname || product.metaltype;
                        }
                        return (
                            fieldValue?.toLowerCase().includes(item.name.toLowerCase()) ||
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

    const handlePageChange = useCallback((page) => {
        setIsTransitioning(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
            setCurrentPage(page);
            setIsTransitioning(false);
        }, 200);
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
        console.log(searchData)
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

            const sortedMatchedDesigns = getMatchedDesignCollections(res, allDesignCollections);

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
        setLoading(true);
        const fetchData = async () => {
            try {
                const res = await designCollectionApi();
                const allProducts = res?.rd || [];
                if (!mounted) return;
                setAllDesignCollections(allProducts);
            } catch (err) {
                console.error(err);
                setError("Failed to load products");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();
        return () => {
            mounted = false;
        };
    }, []);


    if (loading) return <FullPageLoader open={true} />;

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
                        mb: 2,
                        pt: 2,

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
                        {/* <Button
                            variant="text"
                            startIcon={<Filter size={18} />}
                            disableRipple
                            onClick={() => setIsFilterOpen(true)}
                            sx={{
                                textTransform: "none",
                                textDecoration: "underline",
                                color: "text.primary",
                                fontSize: 14,
                            }}
                        >
                            Filter
                        </Button> */}
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

                        {/* Render Filter Chips with Grouping */}
                        <FilterChips
                            appliedFilters={appliedFilters}
                            onRemoveFilter={removeFilter}
                            onImageChipClick={handlePopoverOpen}
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
                bottom: urlParamsFlag && urlParamsFlag == 'fe' ? 120 : 50,
                left: 0,
                right: 0,
                p: 2,
                zIndex: 1000
            }}>
                <Box sx={{ maxWidth: 650, width: "100%", mx: "auto" }}>
                    <ModernSearchBar onSubmit={handleSubmit} onFilterClick={() => setIsFilterOpen(true)} appliedFilters={appliedFilters} onApply={handleApplyFilters} />
                </Box>
                <ScrollToTop bottom={urlParamsFlag && urlParamsFlag == 'fe' ? 70 : 24} />
            </Box>

            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={handleApplyFilters}
                appliedFilters={appliedFilters}
                onSearch={handleSearch}
                currentSearchTerm={searchTerm}
            />

            {/* Image Preview Popover */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: { p: 1, maxWidth: 300 }
                }}
            >
                {popoverContent && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {popoverContent.imageUrl && (
                            <Box
                                sx={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    '&:hover .overlay': { opacity: 1 }
                                }}
                                onClick={() => handleImageClick(popoverContent.imageUrl)}
                            >
                                <img
                                    src={popoverContent.imageUrl}
                                    alt="Search Preview"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: 200,
                                        objectFit: 'cover',
                                        borderRadius: 4
                                    }}
                                />
                                <Box
                                    className="overlay"
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        bgcolor: 'rgba(0,0,0,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        borderRadius: 1
                                    }}
                                >
                                    <Maximize2 color="white" size={24} />
                                </Box>
                            </Box>
                        )}
                        {popoverContent.text && (
                            <Typography variant="body2" sx={{ px: 1, pb: 0.5 }}>
                                Text: <strong>{popoverContent.text}</strong>
                            </Typography>
                        )}
                    </Box>
                )}
            </Popover>

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
                        width: 280,
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
                    {filterPopoverItems.map(({ category, item }) => (
                        <Chip
                            key={item.id}
                            label={item.name}
                            size="small"
                            sx={{
                                maxWidth: '100%',
                                justifyContent: 'space-between',
                                '& .MuiChip-label': {
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block',
                                    flexGrow: 1,
                                    pr: 0.5,
                                },
                                '& .MuiChip-deleteIcon': {
                                    marginLeft: 'auto',
                                    marginRight: 0,
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
                    ))}
                </Box>
            </Popover>

            {/* Full Screen Image Viewer */}
            <ImageViewerModal
                open={isImageViewerOpen}
                onClose={() => setIsImageViewerOpen(false)}
                imageUrl={viewerImage}
            />

            {/* Similar Products Modal */}
            <SimilarProductsModal
                open={isSimilarModalOpen}
                onClose={handleSimilarModalClose}
                baseProduct={currentSimilarProduct}
                allProducts={allDesignCollections}
                onSearchSimilar={handleSearchSimilar}
                onBack={handleSimilarBack}
                canGoBack={similarProductHistory.length > 1}
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

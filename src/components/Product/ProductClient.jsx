"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { logErrorToServer } from "@/utils/errorLogger";
import {
    Container,
    Box,
    Button,
    Typography,
    Fade,
    Popover,
    Tooltip,
    Chip,
} from "@mui/material";

import ModernSearchBar from "@/components/ModernSearchBar";
import ScrollToTop from "@/components/ScrollToTop";
import FullPageLoader from "@/components/FullPageLoader";
import FilterSidebar from "@/components/Product/FilterSidebar";
import PaginationControls from "@/components/PaginationControls";
import { SearchModeToggle } from "../Common/HomeCommon";
import { searchService } from "@/services/apiService";
import { autoScrollToRestoredTarget, base64ToFile, compressImagesToWebP } from "@/utils/globalFunc";
import ProductGrid from "./ProductGrid";
import ProductListView from "./ProductListView";
import ProductSummaryCards from "./ProductSummaryCards";
import SimilarProductsModal from "./SimilarProductsModal";
import { getMatchedDesignCollections, filterProducts, createSearchChip } from "./ProductHelpers";
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { useProductData } from '@/context/ProductDataContext';
import GridBackground from "@/components/Common/GridBackground";
import { isFrontendFeRoute } from "@/utils/urlUtils";

import ProductPageHeader from "@/components/Product/ProductPageHeader";
import ReusableConfirmModal from '@/components/Common/modals/ReusableConfirmModal';
import { AiMaintenanceModal, AiSubscriptionModal, AiTrainingModal } from '@/components/Common/modals';
import { MultiSelectProvider, useMultiSelect } from '@/context/MultiSelectContext';
import { saveAiSearchRequestApi } from '@/app/api/saveAiSearchRequestApi';
import { useAuth } from '@/context/AuthContext';
import { TokenUsageProvider, useTokenUsage } from '@/context/TokenUsageContext';
import { getTokenDetailsApi } from '@/app/api/getTokenDetailsApi';
import { getTokenMasterApi, getTokenCost } from '@/app/api/getTokenMasterApi';


function ProductClientContent({ onInitialLoadComplete }) {
    const PRODUCT_LIST_RESTORE_KEY = 'productListRestoreState';
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isInitialLoadPending, setIsInitialLoadPending] = useState(true);
    const [isFilterLoading, setIsFilterLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false); // New state for removal confirm
    const [isSearchBarExpanded, setIsSearchBarExpanded] = useState(true);
    const { totalCount, items: cartItems, addToCart, removeFromCart } = useCart();
    const { showSuccess, showInfo, showWarning } = useToast();
    const router = useRouter();

    // Multi-select context
    const {
        isMultiSelectMode,
        selectedCount,
        toggleMultiSelectMode,
        clearSelection,
        getSelectedProducts,
        selectAll,
        selectBatch,
        deselectBatch,
        isProductSelected
    } = useMultiSelect();

    const didAttemptRestoreRef = useRef(false);
    const skipNextPageResetRef = useRef(false);
    const isRestoringRef = useRef(false);
    const pendingRestoreStateRef = useRef(null);
    const [restoreTargetIndex, setRestoreTargetIndex] = useState(undefined);

    // Use product data context
    const { productData: allDesignCollections, isLoading: isLoadingProducts, fetchProductData, pendingSearch, setPendingSearch } = useProductData();
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const [appliedFilters, setAppliedFilters] = useState([]);
    const [urlParamsFlag, setUrlParamsFlag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [searchMode, setSearchMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('searchMode') || 'design';
        }
        return 'design';
    });
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [subscriptionVariant, setSubscriptionVariant] = useState('subscription');
    const [showTrainingModal, setShowTrainingModal] = useState(false);

    // View mode state (grid or list)
    const [viewMode, setViewMode] = useState(() => {
        // if (typeof window !== 'undefined') {
        //     return sessionStorage.getItem('productViewMode') || 'grid';
        // }
        return 'grid';
    });

    // Summary cards visibility
    const [showSummary, setShowSummary] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('showProductSummary');
            return saved !== null ? saved === 'true' : true; // Default to true
        }
        return true;
    });

    // Get auth context for config flags
    const { isConfigEnabled } = useAuth();
    const { incrementUsage: incrementTokenUsage, setTokenData, refreshTokens, hasEnoughTokens } = useTokenUsage();

    // Fetch token master config on mount
    useEffect(() => {
        getTokenMasterApi();
    }, []);

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
        // 1. Priority: Context-based pending search (instant from Home)
        if (pendingSearch) {
            const data = { ...pendingSearch };
            setPendingSearch(null); // Clear it so it doesn't re-run

            if (data.mode) setSearchMode(data.mode);
            if (Array.isArray(data.filters)) setAppliedFilters(data.filters);

            // Start submission immediately
            handleSubmit(data);
            return;
        }

        // 2. Fallback: Session storage (for refreshes or older flows)
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
                    if (searchData.mode) {
                        setSearchMode(searchData.mode);
                    }
                    handleSubmit({ ...searchData, mode: searchData.mode || 'ai' });
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
    }, [allDesignCollections, pendingSearch, setPendingSearch]);

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
            return saved ? parseInt(saved, 10) : 200;
        }
        return 200;
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
        return filterProducts(baseDataset, appliedFilters, debouncedSearchTerm);
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
        if (isRestoringRef.current) {
            return;
        }
        if (skipNextPageResetRef.current) {
            skipNextPageResetRef.current = false;
            return;
        }
        setCurrentPage(1);
    }, [finalFilteredProducts]);

    useEffect(() => {
        if (didAttemptRestoreRef.current) return;
        if (typeof window === 'undefined') return;

        const raw = sessionStorage.getItem(PRODUCT_LIST_RESTORE_KEY);
        if (!raw) {
            didAttemptRestoreRef.current = true;
            return;
        }

        let state = null;
        try {
            state = JSON.parse(raw);
        } catch (e) {
            sessionStorage.removeItem(PRODUCT_LIST_RESTORE_KEY);
            didAttemptRestoreRef.current = true;
            return;
        }

        didAttemptRestoreRef.current = true;
        isRestoringRef.current = true;
        pendingRestoreStateRef.current = state;

        if (typeof state?.searchTerm === 'string') {
            setSearchTerm(state.searchTerm);
        }
        if (Array.isArray(state?.appliedFilters)) {
            setAppliedFilters(state.appliedFilters);
        }
        if (state && Object.prototype.hasOwnProperty.call(state, 'searchResults')) {
            setSearchResults(state.searchResults);
        }
        if (state?.searchMode) {
            setSearchMode(state.searchMode);
        }
    }, []);

    useEffect(() => {
        if (searchMode) {
            sessionStorage.setItem('searchMode', searchMode);
        }
    }, [searchMode]);

    useEffect(() => {
        if (viewMode) {
            sessionStorage.setItem('productViewMode', viewMode);
        }
    }, [viewMode]);

    useEffect(() => {
        sessionStorage.setItem('showProductSummary', showSummary.toString());
    }, [showSummary]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!pendingRestoreStateRef.current) return;
        if (!Number.isFinite(totalPages) || totalPages < 1) return;

        const state = pendingRestoreStateRef.current;
        pendingRestoreStateRef.current = null;
        sessionStorage.removeItem(PRODUCT_LIST_RESTORE_KEY);

        const nextPageRaw = Number(state?.currentPage);
        const nextPage = Number.isFinite(nextPageRaw)
            ? Math.min(Math.max(nextPageRaw, 1), totalPages || 1)
            : 1;

        const targetIndexRaw = Number(state?.targetIndex);
        const targetIndex = Number.isFinite(targetIndexRaw) && targetIndexRaw >= 0
            ? targetIndexRaw
            : undefined;

        setRestoreTargetIndex(targetIndex);
        skipNextPageResetRef.current = true;
        setCurrentPage(nextPage);

        const targetId = state?.productId != null ? String(state.productId) : null;
        const scrollYRaw = Number(state?.scrollY);
        const scrollY = Number.isFinite(scrollYRaw) && scrollYRaw >= 0 ? scrollYRaw : null;

        autoScrollToRestoredTarget({
            targetId,
            scrollY,
            dataAttr: 'data-product-id',
        });

        requestAnimationFrame(() => {
            isRestoringRef.current = false;
        });
    }, [totalPages]);

    const handleOpenCart = useCallback(() => {
        if (typeof window === 'undefined') {
            router.push('/cart');
            return;
        }

        let productId = null;
        let targetIndex = null;

        try {
            const nodes = Array.from(document.querySelectorAll('[data-product-id][data-product-index]'));
            let bestNode = null;
            let bestTop = Number.POSITIVE_INFINITY;
            for (const node of nodes) {
                const rect = node.getBoundingClientRect();
                const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
                if (!isVisible) continue;
                if (rect.top < bestTop) {
                    bestTop = rect.top;
                    bestNode = node;
                }
            }

            if (bestNode) {
                productId = bestNode.getAttribute('data-product-id');
                const idx = Number(bestNode.getAttribute('data-product-index'));
                targetIndex = Number.isFinite(idx) ? idx : null;
            }
        } catch (e) {
        }

        const payload = {
            currentPage,
            productId,
            targetIndex,
            scrollY: window.scrollY,
            appliedFilters,
            searchTerm,
            searchResults,
            searchMode,
            timestamp: Date.now(),
        };

        try {
            sessionStorage.setItem(PRODUCT_LIST_RESTORE_KEY, JSON.stringify(payload));
        } catch (e) {
        }

        router.push('/cart');
    }, [router, currentPage, appliedFilters, searchTerm, searchResults]);

    // Multi-select handlers
    const handleBulkAddToCart = useCallback(() => {
        const selectedProducts = getSelectedProducts(finalFilteredProducts);

        if (selectedProducts.length === 0) {
            return;
        }

        let addedCount = 0;
        selectedProducts.forEach(product => {
            // Check if already in cart to avoid double-counting/quantity increment in bulk
            const alreadyInCart = cartItems.some(item => item.id === product.id);
            if (!alreadyInCart) {
                addToCart(product);
                addedCount++;
            }
        });

        // Exit multi-select mode and clear selections
        toggleMultiSelectMode();

        // Show success feedback
        if (addedCount > 0) {
            showSuccess(`${addedCount} ${addedCount === 1 ? 'item' : 'items'} added to cart`);
        } else {
            showInfo('All selected items are already in your cart');
        }
    }, [getSelectedProducts, finalFilteredProducts, addToCart, toggleMultiSelectMode, cartItems, showSuccess, showInfo]);

    const isRemovalMode = useMemo(() => {
        const selectedProducts = getSelectedProducts(finalFilteredProducts);
        if (selectedProducts.length === 0) return false;
        // If ALL selected products are already in cart, show "Remove from Cart"
        return selectedProducts.every(product =>
            cartItems.some(item => item.id === product.id)
        );
    }, [getSelectedProducts, finalFilteredProducts, cartItems]);

    const newItemsCount = useMemo(() => {
        const selectedProducts = getSelectedProducts(finalFilteredProducts);
        return selectedProducts.filter(product =>
            !cartItems.some(item => item.id === product.id)
        ).length;
    }, [getSelectedProducts, finalFilteredProducts, cartItems]);

    const handleBulkRemoveFromCart = useCallback(() => {
        setIsRemoveConfirmOpen(true);
    }, []);

    const executeBulkRemove = useCallback(() => {
        const selectedProducts = getSelectedProducts(finalFilteredProducts);
        const removedCount = selectedProducts.length;
        selectedProducts.forEach(product => {
            removeFromCart(product.id);
        });
        setIsRemoveConfirmOpen(false);
        toggleMultiSelectMode();
        showSuccess(`${removedCount} ${removedCount === 1 ? 'item' : 'items'} removed from cart`);
    }, [getSelectedProducts, finalFilteredProducts, removeFromCart, toggleMultiSelectMode, showSuccess]);

    const isAllSelected = useMemo(() => {
        if (!displayedProducts.length) return false;
        return displayedProducts.every(p => isProductSelected(p.id));
    }, [displayedProducts, isProductSelected]);

    const handleSelectAllToggle = useCallback(() => {
        const ids = displayedProducts.map(p => p.id);
        if (isAllSelected) {
            deselectBatch(ids);
            showInfo('All items deselected');
        } else {
            selectBatch(ids);
            showSuccess(`${ids.length} items selected`);
        }
    }, [isAllSelected, displayedProducts, selectBatch, deselectBatch, showSuccess, showInfo]);

    const handleCancelMultiSelect = useCallback(() => {
        toggleMultiSelectMode();
    }, [toggleMultiSelectMode]);

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
                setSearchTerm('');
                setDebouncedSearchTerm('');
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
        setDebouncedSearchTerm('');
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



    const handleSubmit = useCallback(async (searchData) => {
        const requestedMode = searchData?.mode || searchMode;
        const modeToUse = requestedMode === 'design' && searchData?.image ? 'ai' : requestedMode;

        // Check config flags if AI mode is selected
        if (modeToUse === 'ai') {
            // Check IsAiMaintenance first
            if (isConfigEnabled('IsAiMaintenance')) {
                setShowMaintenanceModal(true);
                return;
            }
            // Check IsAiEnable (when enabled, show subscription modal)
            if (isConfigEnabled('IsAiEnable')) {
                setSubscriptionVariant('subscription');
                setShowSubscriptionModal(true);
                return;
            }
            // Check IsAiReady (when enabled, show training modal)
            if (isConfigEnabled('IsAiReady')) {
                setShowTrainingModal(true);
                return;
            }
            // Determine search type for token cost check
            let effectiveSearchFlag = searchData?.isSearchFlag ?? 0;
            if (effectiveSearchFlag === 0) {
                if (searchData?.image && searchData?.text) effectiveSearchFlag = 3;
                else if (searchData?.image) effectiveSearchFlag = 2;
                else if (searchData?.text) effectiveSearchFlag = 1;
            }
            const eventNames = { 1: 'TextSearch', 2: 'ImageSearch', 3: 'HybridSearch' };
            const eventName = eventNames[effectiveSearchFlag] || 'TextSearch';

            // Check token availability before AI search (fresh API call)
            const tokenData = await getTokenDetailsApi();
            if (!tokenData) {
                setSubscriptionVariant('upgrade');
                setShowSubscriptionModal(true);
                return;
            }
            // Sync local state with fresh API data
            setTokenData(tokenData);
            const freshRemaining = Math.max(0, (tokenData.totalToken ?? 0) - (tokenData.tokenUsed ?? 0));
            const searchCost = getTokenCost(eventName);
            if (freshRemaining < searchCost) {
                setSubscriptionVariant('upgrade');
                setShowSubscriptionModal(true);
                return;
            }
        }

        // Resiliency check: if isSearchFlag is 0 or missing but we have content, infer it
        let effectiveSearchFlag = searchData?.isSearchFlag ?? 0;
        if (effectiveSearchFlag === 0 && modeToUse === 'ai') {
            if (searchData?.image && searchData?.text) effectiveSearchFlag = 3;
            else if (searchData?.image) effectiveSearchFlag = 2;
            else if (searchData?.text) effectiveSearchFlag = 1;
        }

        if ((!effectiveSearchFlag || effectiveSearchFlag === 0) && modeToUse === 'ai') {
            setIsSearchLoading(true);
            setLastSearchData({ ...searchData, mode: modeToUse });
            setError(null);
            incrementTokenUsage(getTokenCost('TextSearch'));

            setTimeout(() => {
                setSearchResults(null);
                setSearchTerm(searchData?.text || '');
                setDebouncedSearchTerm(searchData?.text || '');
                setIsSearchLoading(false);
            }, 300);
            return;
        }

        // In design mode, we don't call the search API, just navigate/filter
        // UNLESS an image is provided, then we force AI search
        if (modeToUse === 'design' && !searchData?.image) {
            setIsSearchLoading(true);
            setLastSearchData({ ...searchData, mode: modeToUse });
            setError(null);
            incrementTokenUsage(getTokenCost('TextSearch'));

            // Synthetic delay to show the search loader and prevent flicker
            setTimeout(() => {
                setSearchResults(null);
                setSearchTerm(searchData.text || '');
                setDebouncedSearchTerm(searchData.text || '');
                setAppliedFilters(prev =>
                    prev.filter(
                        (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
                    )
                );
                setIsSearchLoading(false);
            }, 600);
            return;
        }

        setLastSearchData({ ...searchData, mode: modeToUse });
        setError(null);
        setIsSearchLoading(true);
        const eventNames = { 1: 'TextSearch', 2: 'ImageSearch', 3: 'HybridSearch' };
        incrementTokenUsage(getTokenCost(eventNames[effectiveSearchFlag] || 'TextSearch'));
        let finalImage = searchData.image;
        try {
            const options = {
                top_k: searchData?.numResults || "10",
                aiApi: sessionStorage.getItem('aiApi') || "",
                min_percent: searchData?.accuracy || "50.0",
            };

            // Skip compression if already handled (e.g., from Home page)
            if (finalImage && !searchData.isPreProcessed && (searchData.isSearchFlag === 2 || searchData.isSearchFlag === 3)) {
                try {
                    const compressedResults = await compressImagesToWebP(finalImage);
                    if (compressedResults.length > 0) {
                        finalImage = compressedResults[0].blob;
                    }
                } catch (compressErr) {
                    logErrorToServer({
                        shortReason: "Image compression failed on Product page",
                        detailedReason: compressErr
                    });
                }
            }

            const res = await (async () => {
                if (effectiveSearchFlag === 1) {
                    return searchService.searchByText(searchData.text?.trim(), options);
                }
                if (effectiveSearchFlag === 2) {
                    return searchService.searchByImage(finalImage, options);
                }
                if (effectiveSearchFlag === 3) {
                    return searchService.searchHybrid(
                        { file: finalImage, query: searchData.text?.trim() },
                        options
                    );
                }
            })();

            if (!res || !Array.isArray(res)) {
                // Background logging for Failure (Unexpected Response)
                const eventNames = { 1: "TextSearch", 2: "ImageSearch", 3: "HybridSearch" };
                saveAiSearchRequestApi({
                    EventName: eventNames[effectiveSearchFlag] || "AiSearch",
                    SearchText: searchData.text || "",
                    ImageFile: finalImage,
                    IsSuccess: "0"
                }).catch(logErr => console.error("Logging failed:", logErr));

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

            const searchChip = createSearchChip(searchData);

            if (searchChip) {
                setAppliedFilters((prev) => [
                    searchChip,
                    ...prev.filter(
                        (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
                    ),
                ]);
            }

            // Background logging for Success
            const eventNames = { 1: "TextSearch", 2: "ImageSearch", 3: "HybridSearch" };
            saveAiSearchRequestApi({
                EventName: eventNames[effectiveSearchFlag] || "AiSearch",
                SearchText: searchData.text || "",
                ImageFile: finalImage,
                IsSuccess: "1"
            }).catch(logErr => console.error("Logging failed:", logErr));

        } catch (err) {
            console.error("Search Error:", err);
            logErrorToServer({
                shortReason: "Search execution failed on Product page",
                detailedReason: {
                    message: err.message,
                    stack: err.stack,
                    searchData
                }
            });
            setError("Search failed. Try again.");
            setSearchResults([]);

            // Create error chip to show failed search
            const errorChip = createSearchChip(searchData, true);

            if (errorChip) {
                setAppliedFilters((prev) => [
                    errorChip,
                    ...prev.filter(
                        (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
                    ),
                ]);
            }

            // Background logging for Failure
            const eventNames = { 1: "TextSearch", 2: "ImageSearch", 3: "HybridSearch" };
            saveAiSearchRequestApi({
                EventName: eventNames[effectiveSearchFlag] || "AiSearch",
                SearchText: searchData.text || "",
                ImageFile: finalImage,
                IsSuccess: "0"
            }).catch(logErr => console.error("Logging failed:", logErr));

        } finally {
            setIsSearchLoading(false);
            refreshTokens();
        }
    }, [allDesignCollections, searchMode, isConfigEnabled]);

    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            try {
                await fetchProductData();
            } catch (err) {
                console.error(err);
                if (mounted) setError("Failed to load products");
            } finally {
                if (mounted) {
                    setIsInitialLoadPending(false);
                    onInitialLoadComplete?.();
                }
            }
        };
        loadData();
        return () => {
            mounted = false;
        };
    }, [fetchProductData, onInitialLoadComplete]);

    const loading = isLoadingProducts;
    const showInitialLoader = isInitialLoadPending || loading;

    const getBottomPadding = () => {
        if (finalFilteredProducts.length > 7) {
            return { xs: 28, sm: 36, md: 50 };
        }
        return 5;
    };

    return (
        <GridBackground>
            <Container maxWidth={false} sx={{ px: 0, pb: getBottomPadding(), position: "relative", zIndex: 2, pl: { xs: 2, md: isFilterOpen ? '340px' : 0 }, transition: 'padding-left 0.4s cubic-bezier(0.86, 0, 0.07, 1), opacity 0.4s ease', opacity: showInitialLoader ? 0 : 1, pointerEvents: showInitialLoader ? 'none' : 'auto' }} disableGutters>
                <ProductPageHeader
                    isMultiSelectMode={isMultiSelectMode}
                    selectedCount={selectedCount}
                    isAllSelected={isAllSelected}
                    onCancelMultiSelect={handleCancelMultiSelect}
                    onSelectAllToggle={handleSelectAllToggle}
                    onBulkAddToCart={handleBulkAddToCart}
                    onBulkRemoveFromCart={handleBulkRemoveFromCart}
                    isRemovalMode={isRemovalMode}
                    newItemsCount={newItemsCount}
                    onToggleMultiSelectMode={() => toggleMultiSelectMode(cartItems.map(item => item.id))}
                    onHomeClick={() => router.push('/')}
                    onOpenCart={handleOpenCart}
                    totalCartItems={totalCount}
                    productCount={finalFilteredProducts.length}
                    appliedFilters={appliedFilters}
                    searchTerm={searchTerm}
                    onRemoveFilter={removeFilter}
                    onClearSearchTerm={() => {
                        setSearchTerm('');
                        setDebouncedSearchTerm('');
                    }}
                    onClearAllFilters={clearAllFilters}
                    onFilterPopoverOpen={handleFilterPopoverOpen}
                    isFilterOpen={isFilterOpen}
                    searchMode={searchMode}
                    onFilterClick={() => setIsFilterOpen(prev => !prev)}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    showSummary={showSummary}
                    onToggleSummary={() => setShowSummary(prev => !prev)}
                    onTokenUpgrade={() => {
                        setSubscriptionVariant('upgrade');
                        setShowSubscriptionModal(true);
                    }}
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
                            {/* Summary Cards */}
                            {showSummary && viewMode === 'list' && (
                                <ProductSummaryCards
                                    products={finalFilteredProducts}
                                />
                            )}

                            {viewMode === 'grid' ? (
                                <ProductGrid
                                    designData={displayedProducts}
                                    appliedFilters={appliedFilters}
                                    clearAllFilters={clearAllFilters}
                                    onSearchSimilar={handleSearchSimilar}
                                    loading={isFilterLoading}
                                    isFilterOpen={isFilterOpen}
                                    restoreTargetIndex={restoreTargetIndex}
                                    searchTerm={searchTerm}
                                    searchMode={searchMode}
                                />
                            ) : (
                                <ProductListView
                                    designData={displayedProducts}
                                    onSearchSimilar={handleSearchSimilar}
                                    loading={isFilterLoading}
                                    restoreTargetIndex={restoreTargetIndex}
                                />
                            )}
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
                left: 0,
                right: 0,
                p: 2,
                zIndex: 1000,
            }}>
                <Box sx={{ maxWidth: 650, width: "100%", mx: "auto" }}>
                    <Fade in={isSearchBarExpanded} unmountOnExit>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <SearchModeToggle
                                activeMode={searchMode}
                                onModeChange={setSearchMode}
                                onMaintenanceClick={() => setShowMaintenanceModal(true)}
                                onSubscriptionClick={() => {
                                    setSubscriptionVariant('subscription');
                                    setShowSubscriptionModal(true);
                                }}
                                onTrainingClick={() => setShowTrainingModal(true)}
                                isConfigEnabled={isConfigEnabled}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    width: 'fit-content',
                                    p: 1,
                                    mb: 0.5,
                                    mx: 'auto',
                                }}
                            />
                        </Box>
                    </Fade>
                    <ModernSearchBar
                        onSubmit={handleSubmit}
                        onMaintenanceClick={() => setShowMaintenanceModal(true)}
                        onFilterClick={() => setIsFilterOpen(prev => !prev)}
                        appliedFilters={appliedFilters}
                        onApply={handleApplyFilters}
                        isFilterOpen={isFilterOpen}
                        initialExpanded={true}
                        suggestionPosition="top"
                        showSuggestions={true}
                        isLoading={isSearchLoading}
                        productData={allDesignCollections}
                        onSuggestionClick={handleSuggestionClick}
                        searchMode={searchMode}
                        alwaysExpanded={true}
                        autoFocus={!showInitialLoader}
                        onImageUpload={() => setSearchMode('ai')}
                        onExpandChange={setIsSearchBarExpanded}
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
                productData={allDesignCollections}
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
                showLogo={lastSearchData?.mode === 'ai'}
                rotatingType={
                    lastSearchData?.mode === 'ai'
                        ? ({ 1: 'text', 2: 'image', 3: 'hybrid' }[lastSearchData?.isSearchFlag] || 'text')
                        : undefined
                }
                subtitle={
                    lastSearchData?.mode !== 'ai'
                        ? (lastSearchData?.text?.trim()
                            ? `Finding matches for "${lastSearchData.text.trim()}"`
                            : "Analyzing your design and matching collections")
                        : undefined
                }
            />
            <ReusableConfirmModal
                open={isRemoveConfirmOpen}
                onClose={() => setIsRemoveConfirmOpen(false)}
                onConfirm={executeBulkRemove}
                type="bulkRemove"
            />

            {/* AI Maintenance Modal */}
            <AiMaintenanceModal
                open={showMaintenanceModal}
                onClose={() => setShowMaintenanceModal(false)}
                onSwitchToDesign={() => setSearchMode('design')}
            />

            {/* AI Subscription Modal */}
            <AiSubscriptionModal
                open={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                variant={subscriptionVariant}
            />

            {/* AI Training Modal */}
            <AiTrainingModal
                open={showTrainingModal}
                onClose={() => setShowTrainingModal(false)}
            />
        </GridBackground >
    );
}

// Wrap with MultiSelectProvider and TokenUsageProvider
export default function ProductClient({ onInitialLoadComplete }) {
    return (
        <TokenUsageProvider>
            <MultiSelectProvider>
                <ProductClientContent onInitialLoadComplete={onInitialLoadComplete} />
            </MultiSelectProvider>
        </TokenUsageProvider>
    );
}

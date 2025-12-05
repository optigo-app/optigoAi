"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Typography,
} from "@mui/material";
import { LayoutGrid, LayoutList, SlidersHorizontal, Image } from "lucide-react";
import productsData from "@/data/Product.json";
import ProductGrid from "@/components/ProductGrid";
import ModernSearchBar from "@/components/ModernSearchBar";
import ScrollToTop from "@/components/ScrollToTop";
import FullPageLoader from "@/components/FullPageLoader";
import FilterDrawer from "@/components/FilterDrawer";
import { designCollectionApi } from "@/app/api/designCollectionApi";
import { searchService } from "@/services/apiService";
import Fuse from "fuse.js";

export default function ProductPage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [allDesignCollections, setAllDesignCollections] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [productCount, setProductCount] = useState();
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [urlParamsFlag, setUrlParamsFlag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const flag = sessionStorage.getItem("urlParams");
    setUrlParamsFlag(flag);
  }, []);

  const [searchResults, setSearchResults] = useState(null);
  const [lastSearchData, setLastSearchData] = useState(null);

  const itemsPerPage = 24;

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
    if (searchTerm.trim() && searchTerm.trim().length >= 2) {
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
      const results = fuse.search(searchTerm.trim());
      temp = results.map(result => result.item);
    }

    return temp;
  }, [baseDataset, appliedFilters, searchTerm]);

  useEffect(() => {
    if (finalFilteredProducts.length === 0) {
      setDisplayedProducts([]);
      setHasMore(false);
      setProductCount(0);
      return;
    }

    if (finalFilteredProducts.length <= itemsPerPage) {
      setDisplayedProducts(finalFilteredProducts);
      setHasMore(false);
      setProductCount(finalFilteredProducts.length);
    } else {
      setDisplayedProducts(finalFilteredProducts.slice(0, itemsPerPage));
      setHasMore(true);
      setProductCount(finalFilteredProducts.length);
    }
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
      }
      setAppliedFilters(newApplied);
    },
    [appliedFilters]
  );

  const clearAllFilters = useCallback(() => {
    setAppliedFilters([]);
    setSearchResults(null);
    setSearchTerm('');
  }, []);

  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      const source = finalFilteredProducts;
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newData = source.slice(startIndex, endIndex);

      if (!newData || newData.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedProducts((prev) => [...prev, ...newData]);
        setCurrentPage((prev) => prev + 1);
        if (endIndex >= source.length) {
          setHasMore(false);
        }
      }
      setLoadingMore(false);
    }, 100);
  }, [loadingMore, hasMore, finalFilteredProducts, currentPage, itemsPerPage]);

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
    setLastSearchData(searchData);
    setError(null);
    setLoading(true);
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
        searchChip = {
          category: "Image",
          item: { id: "image-search", name: "Image Search", icon: true },
        };
      } else if (searchData?.isSearchFlag === 3) {
        searchChip = {
          category: "Hybrid",
          item: { id: "hybrid-search", name: "Hybrid Search" },
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
    } finally {
      setLoading(false);
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
        setDisplayedProducts(allProducts.slice(0, itemsPerPage));
        setHasMore(allProducts.length > itemsPerPage);
        setProductCount(allProducts.length);
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

  return (
    <>
      <Container maxWidth={false} sx={{ px: 2, pb: 12 }} disableGutters>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            pt: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Button
              variant="text"
              startIcon={<SlidersHorizontal size={18} />}
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
            </Button>

            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              {productCount} products
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
            {appliedFilters.map(({ category, item }) => (
              <Chip
                key={item.id}
                icon={item.icon ? <Image size={14} /> : undefined}
                label={`${category}: ${item.name}`}
                size="small"
                onDelete={() => removeFilter({ item })}
                sx={item.id && item.id.toString().includes('search') ? { bgcolor: 'primary.main', color: 'primary.contrastText' } : {}}
              />
            ))}

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

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, v) => v && setViewMode(v)}
            size="small"
            sx={{
              padding: '5px 10px'
            }}
          >
            <ToggleButton value="card">
              <LayoutList size={18} />
            </ToggleButton>
            <ToggleButton value="grid">
              <LayoutGrid size={18} />
            </ToggleButton>
          </ToggleButtonGroup>
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
          <ProductGrid
            products={productsData}
            designData={displayedProducts}
            loadMore={loadMoreProducts}
            hasMore={hasMore}
            loadingMore={loadingMore}
            appliedFilters={appliedFilters}
            clearAllFilters={clearAllFilters}
          />
        )}
      </Container>

      <Box className="modernSearchInputBox" sx={{
        position: "fixed",
        bottom: urlParamsFlag && urlParamsFlag == 'fe' ? 120 : 50,
        left: 0,
        right: 0,
        p: 2,
        zIndex: 1000
      }}>
        <Box sx={{ maxWidth: 600, width: "100%", mx: "auto" }}>
          <ModernSearchBar onSubmit={handleSubmit} />
        </Box>
        <ScrollToTop />
      </Box>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilters}
        appliedFilters={appliedFilters}
        onSearch={handleSearch}
        currentSearchTerm={searchTerm}
      />
    </>
  );
}

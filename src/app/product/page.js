"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Fade,
  Popover,
  IconButton,
} from "@mui/material";
import { Maximize2, Filter } from "lucide-react";
import ImageViewerModal from "@/components/ImageViewerModal";
import productsData from "@/data/Product.json";
import ProductGrid from "@/components/ProductGrid";
import ModernSearchBar from "@/components/ModernSearchBar";
import ScrollToTop from "@/components/ScrollToTop";
import FullPageLoader from "@/components/FullPageLoader";
import FilterDrawer from "@/components/FilterDrawer";
import PaginationControls from "@/components/PaginationControls";
import { designCollectionApi } from "@/app/api/designCollectionApi";
import { searchService } from "@/services/apiService";
import Fuse from "fuse.js";
import FilterChips from "@/components/FilterChips";

export default function ProductPage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [allDesignCollections, setAllDesignCollections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [urlParamsFlag, setUrlParamsFlag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Image Preview State
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);

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

  useEffect(() => {
    const flag = sessionStorage.getItem("urlParams");
    setUrlParamsFlag(flag);
  }, []);

  const [searchResults, setSearchResults] = useState(null);
  const [lastSearchData, setLastSearchData] = useState(null);

  // Items per page with sessionStorage persistence
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = sessionStorage.getItem('productsPerPage');
    return saved ? parseInt(saved, 10) : 100;
  });

  // Save itemsPerPage to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('productsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  const handleItemsPerPageChange = useCallback((newValue) => {
    setItemsPerPage(newValue);
    setCurrentPage(1); // Reset to first page when changing items per page
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

  console.log("displayedProducts", displayedProducts);

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

            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Button
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
            </Button>
            {/* <IconButton
              size="small"
              onClick={() => setIsFilterOpen(true)}
              sx={{
                p: 0,
                color: "text.primary",
                fontSize: 14,
              }}
            >
              <Filter size={18} />
            </IconButton> */}

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

            {/* <ToggleButtonGroup
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
            </ToggleButtonGroup> */}
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
          sx: { p: 2, maxWidth: 300 }
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filterPopoverItems.map(({ category, item }) => (
            <Chip
              key={item.id}
              label={`${category}: ${item.name}`}
              size="small"
              onDelete={() => {
                removeFilter({ item });
                if (filterPopoverItems.length <= 1) {
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
    </>
  );
}

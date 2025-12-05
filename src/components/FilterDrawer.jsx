"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Typography,
  Skeleton,
} from "@mui/material";
import { X, ChevronDown } from "lucide-react";

import "../Style/FilterDrawer.scss";
import { filterMasterApi } from "@/app/api/filterMasterApi";
import { formatMasterData } from "@/utils/globalFunc";

export default function FilterDrawer({ isOpen, onClose, onApply, appliedFilters = [] }) {
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [loadingFilters, setLoadingFilters] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      setLoadingFilters(true);
      try {
        const data = await filterMasterApi();
        const formattedFilters = formatMasterData(data);
        setFilters(formattedFilters);
      } catch (error) {
        console.error('Failed to load filters:', error);
      } finally {
        setLoadingFilters(false);
      }
    };

    if (isOpen) {
      fetchFilters();
      setSelectedFilters(new Set(appliedFilters.map(({ category, item }) => `${category}-${item.id}`)));
    }
  }, [isOpen]);

  const toggleAccordion = (index) => {
    const updated = [...filters];
    updated[index].expanded = !updated[index].expanded;
    setFilters(updated);
  };

  const toggleFilterItem = (category, item, e) => {
    e.stopPropagation();
    const key = `${category}-${item.id}`;
    const next = new Set(selectedFilters);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedFilters(next);

    // Get the new drawer filters
    const drawerFilters = [];
    filters.forEach(cat => {
      cat.items.forEach(it => {
        if (next.has(`${cat.name}-${it.id}`)) {
          drawerFilters.push({ category: cat.name, item: it });
        }
      });
    });

    // Preserve existing search filters (don't include text-search, image-search, hybrid-search from appliedFilters)
    const searchFilters = appliedFilters.filter(
      (f) => f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id)
    );

    // Combine search filters with drawer filters
    const allAppliedFilters = [...searchFilters, ...drawerFilters];
    
    onApply?.(allAppliedFilters);
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      anchor="left"
      PaperProps={{
        className: "filterDrawer",
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      {/* Header */}
      <Box className="filterDrawer__header">
        <Typography variant="h6">Filters</Typography>
        <button className="filterDrawer__closeBtn" onClick={onClose}>
          <X size={20} />
        </button>
      </Box>

      {/* Active Filter Chips */}
      {selectedFilters.size > 0 && (
        <Box className="filterDrawer__activeFilters" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {Array.from(selectedFilters).map((filterKey) => {
              const [category, id] = filterKey.split('-');
              const filterItem = filters
                .find(cat => cat.name === category)
                ?.items.find(item => item.id === id);
              
              if (!filterItem) return null;
              
              return (
                <Box
                  key={filterKey}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  <span>{filterItem.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = new Set(selectedFilters);
                      next.delete(filterKey);
                      setSelectedFilters(next);
                      
                      const applied = [];
                      filters.forEach(cat => {
                        cat.items.forEach(it => {
                          if (next.has(`${cat.name}-${it.id}`)) {
                            applied.push({ category: cat.name, item: it });
                          }
                        });
                      });
                      onApply?.(applied);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '12px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Filters List */}
      <Box className="filterDrawer__content">
        {loadingFilters ? (
          <Box>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={`skeleton-${index}`} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        ) : (
          filters?.map((category, index) => (
            <Accordion
              key={`${category.name}-${index}`}
              expanded={category.expanded}
              onChange={() => toggleAccordion(index)}
              disableGutters
              className="filterDrawer__accordion"
            >
              <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                <Typography className="filterDrawer__title">
                  {category.name}
                </Typography>
              </AccordionSummary>

              <AccordionDetails className="filterDrawer__details">
                {category?.items?.map((item) => (
                  <FormControlLabel
                    key={item?.id}
                    control={
                      <Checkbox
                        checked={selectedFilters.has(`${category.name}-${item.id}`)}
                        onChange={(e) => toggleFilterItem(category.name, item, e)}
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          '&.Mui-checked': {
                            color: 'primary.main',
                            transform: 'scale(1.1)',
                          },
                          '&:active': {
                            transform: 'scale(0.95)',
                          },
                        }}
                      />
                    }
                    label={item?.name}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Footer */}
      <Box className="filterDrawer__footer">
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
        >
          Done
        </Button>
      </Box>
    </Drawer>
  );
}


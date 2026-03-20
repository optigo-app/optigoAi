"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { TextField, InputAdornment } from "@mui/material";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    Button,
    Box,
    Typography,
    Skeleton,
    IconButton,
    useMediaQuery,
    useTheme,
    Slider,
} from "@mui/material";
import { X, ChevronDown, Search } from "lucide-react";

import "../../Style/FilterSidebar.scss";

import { filterMasterApi } from "@/app/api/filterMasterApi";
import { formatMasterData } from "@/utils/globalFunc";
import useDebounce from "@/hooks/useDebounce";

const FilterItem = React.memo(({ categoryName, item, isSelected, onToggle, focusId, tabIndex, onFocus, onKeyDown, registerFocusable }) => (
    <Box
        ref={(el) => registerFocusable?.(focusId, el)}
        onClick={(e) => onToggle(categoryName, item, e)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        role="checkbox"
        aria-checked={isSelected}
        sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: 1,
            cursor: 'pointer',
            bgcolor: isSelected ? 'primary.light' : 'transparent',
            color: isSelected ? 'primary.contrastText' : 'text.primary',
            transition: 'all 0.2s',
            outline: 'none',
            '&:focus-visible': {
                outline: 'none',
                bgcolor: isSelected ? 'primary.light' : 'action.hover',
            },
            '&:hover': {
                bgcolor: isSelected ? 'primary.light' : 'action.hover',
            }
        }}
    >
        <Checkbox
            checked={isSelected}
            size="small"
            tabIndex={-1}
            sx={{
                p: 0.5,
                mr: 1,
                color: isSelected ? 'inherit' : 'action.active',
                '&.Mui-checked': { color: isSelected ? 'primary.contrastText' : 'inherit' }
            }}
        />
        <Typography variant="body2" sx={{ fontWeight: isSelected ? 500 : 400 }}>
            {item?.name}
        </Typography>
    </Box>
));

FilterItem.displayName = 'FilterItem';

const RangeFilter = React.memo(({ label, field, min, max, value, onChange, unit }) => {
    const vMin = value ? value[0] : min;
    const vMax = value ? value[1] : max;

    const [localValue, setLocalValue] = useState([vMin, vMax]);
    const [inputValue, setInputValue] = useState({ min: vMin.toString(), max: vMax.toString() });

    const prevPropValue = useRef([vMin, vMax]);

    useEffect(() => {
        // If the parent string/number changes independently (e.g. clicking "Clear Filter", or new data bounds)
        if (prevPropValue.current[0] !== vMin || prevPropValue.current[1] !== vMax) {
            setLocalValue([vMin, vMax]);
            setInputValue({ min: vMin.toString(), max: vMax.toString() });
            prevPropValue.current = [vMin, vMax];
        }
    }, [vMin, vMax]);

    const handleSliderChange = (event, newValue) => {
        setLocalValue(newValue);
        setInputValue({ min: newValue[0].toString(), max: newValue[1].toString() });
    };

    const handleSliderChangeCommitted = (event, newValue) => {
        prevPropValue.current = newValue;
        onChange(field, newValue);
    };

    const handleMinInputChange = (e) => {
        setInputValue((prev) => ({ ...prev, min: e.target.value }));
    };

    const handleMaxInputChange = (e) => {
        setInputValue((prev) => ({ ...prev, max: e.target.value }));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            let parseMin = parseFloat(inputValue.min);
            let parseMax = parseFloat(inputValue.max);

            if (isNaN(parseMin) || isNaN(parseMax)) return;

            // clamp bounds to fix inversion or out of bounds typing
            if (parseMin < min) parseMin = min;
            if (parseMax > max) parseMax = max;
            if (parseMin > parseMax) parseMin = parseMax;

            if (parseMin !== localValue[0] || parseMax !== localValue[1]) {
                const next = [parseMin, parseMax];
                setLocalValue(next);
                setInputValue({ min: parseMin.toString(), max: parseMax.toString() });
                prevPropValue.current = next;
                onChange(field, next);
            }
        }, 800);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue.min, inputValue.max, min, max, field, onChange]);

    return (
        <Box sx={{ mb: 3, px: 1, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {label} {unit ? `(${unit})` : ''}
            </Typography>
            <Slider
                value={localValue}
                onChange={handleSliderChange}
                onChangeCommitted={handleSliderChangeCommitted}
                valueLabelDisplay="auto"
                min={min}
                max={max}
                step={field.includes('pcs') ? 1 : 0.01}
                sx={{
                    color: 'text.primary',
                    height: 2,
                    padding: '13px 0',
                    mt: 1.5, // Push slider down so tooltips don't clip at top of the container
                    '& .MuiSlider-thumb': {
                        width: 22,
                        height: 22,
                        backgroundColor: 'currentColor',
                        border: '2px solid',
                        borderColor: 'background.paper',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        '&:hover': {
                            boxShadow: '0 0 0 8px rgba(0, 0, 0, 0.04)',
                        },
                        '&.Mui-active': {
                            boxShadow: '0 0 0 10px rgba(0, 0, 0, 0.08)',
                        },
                    },
                    '& .MuiSlider-track': {
                        height: 2,
                        border: 'none',
                    },
                    '& .MuiSlider-rail': {
                        height: 2,
                        opacity: 0.5,
                        backgroundColor: '#bfbfbf',
                    },
                    '& .MuiSlider-valueLabel': {
                        fontSize: 10,
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 99,
                        // The z-index and container styling ensure it renders over other elements
                    },
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, gap: 2 }}>
                <TextField
                    size="small"
                    placeholder="Min"
                    type="number"
                    value={inputValue.min}
                    onChange={handleMinInputChange}
                    inputProps={{ min, max, step: field.includes('pcs') ? 1 : 0.01 }}
                    sx={{
                        width: '45%',
                        '& input[type=number]': {
                            MozAppearance: 'textfield',
                        },
                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                        },
                        '& .MuiInputBase-input': { py: 0.8, px: 1, fontSize: '0.85rem', textAlign: 'center' }
                    }}
                />
                <Typography variant="body2" color="text.secondary">-</Typography>
                <TextField
                    size="small"
                    placeholder="Max"
                    type="number"
                    value={inputValue.max}
                    onChange={handleMaxInputChange}
                    inputProps={{ min, max, step: field.includes('pcs') ? 1 : 0.01 }}
                    sx={{
                        width: '45%',
                        '& input[type=number]': {
                            MozAppearance: 'textfield',
                        },
                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                        },
                        '& .MuiInputBase-input': { py: 0.8, px: 1, fontSize: '0.85rem', textAlign: 'center' }
                    }}
                />
            </Box>
        </Box>
    );
});

RangeFilter.displayName = 'RangeFilter';

const FilterCategory = React.memo(({ category, index, expanded, onToggleAccordion, selectedFilters, onToggleItem, count, categoryFocusId, registerFocusable, onFocusFocusable, onKeyDownFocusable }) => {
    const headerId = `cat:${category.name}`;

    return (
        <Accordion
            expanded={expanded}
            onChange={() => onToggleAccordion(category)}
            disableGutters
            className="filterSidebar__accordion"
            TransitionProps={{ unmountOnExit: true }}
            sx={{
                boxShadow: 'none',
                '&:before': { display: 'none' },
                mb: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                overflow: 'hidden',
                '&.MuiAccordionSummary-content': { margin: '8px 0px !important' },
            }}
        >
            <AccordionSummary
                ref={(el) => registerFocusable?.(headerId, el)}
                expandIcon={<ChevronDown size={18} />}
                tabIndex={categoryFocusId === headerId ? 0 : -1}
                onFocus={() => onFocusFocusable?.(headerId)}
                onKeyDown={(e) => onKeyDownFocusable?.(e, { kind: 'category', id: headerId, category })}
                sx={{
                    bgcolor: expanded ? 'background.light' : 'background.paper',
                    outline: 'none',
                    '&.Mui-focusVisible': {
                        outline: 'none',
                        bgcolor: 'action.hover',
                    },
                    '&:focus-visible': {
                        outline: 'none',
                        bgcolor: 'action.hover',
                    },
                    '&.Mui-expanded': { minHeight: 40 }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                    <Typography className="filterSidebar__title">
                        {category.name}
                    </Typography>
                    {count > 0 && (
                        <Box sx={{ bgcolor: 'secondary.extraLight', borderRadius: '4px', p: '2px 6px' }}>
                            <Typography variant="caption" sx={{ fontWeight: '500' }}>
                                {count}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </AccordionSummary>

            <AccordionDetails className="filterSidebar__details" sx={{ p: 1, pt: 1 }}>
                <Box className="filterSidebar__list" sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    ...(category?.items?.length > 5 && {
                        maxHeight: '275px',
                        overflowY: 'auto',
                        pr: 1
                    })
                }}>
                    {category?.items?.map((item) => (
                        (() => {
                            const itemId = `item:${category.name}:${item.id}`;
                            return (
                                <FilterItem
                                    key={item.id}
                                    categoryName={category.name}
                                    item={item}
                                    isSelected={selectedFilters.has(`${category.name}-${item.id}`)}
                                    onToggle={onToggleItem}
                                    focusId={itemId}
                                    tabIndex={categoryFocusId === itemId ? 0 : -1}
                                    registerFocusable={registerFocusable}
                                    onFocus={() => onFocusFocusable?.(itemId)}
                                    onKeyDown={(e) => onKeyDownFocusable?.(e, { kind: 'item', id: itemId, category, item })}
                                />
                            );
                        })()
                    ))}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}, (prev, next) => {
    if (prev.expanded !== next.expanded) return false;
    if (prev.count !== next.count) return false;
    if (prev.categoryFocusId !== next.categoryFocusId) return false;
    if (!next.expanded) return true;
    return prev.selectedFilters === next.selectedFilters;
});

FilterCategory.displayName = 'FilterCategory';

export default function FilterSidebar({ isOpen, onClose, onApply, appliedFilters = [], productData = [] }) {
    const [filters, setFilters] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState(new Set());
    const [loadingFilters, setLoadingFilters] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isPending, startTransition] = React.useTransition();
    const [shouldRenderFilters, setShouldRenderFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [focusedId, setFocusedId] = useState(null);
    const [expandedRanges, setExpandedRanges] = useState({});
    const focusablesRef = useRef(new Map());
    const shouldProgrammaticallyFocusRef = useRef(false);
    const pendingFocusIdRef = useRef(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const registerFocusable = useCallback((id, el) => {
        if (!id) return;
        if (el) {
            focusablesRef.current.set(id, el);
        } else {
            focusablesRef.current.delete(id);
        }
    }, []);

    useEffect(() => {
        const fetchFilters = async () => {
            const cachedFilters = sessionStorage.getItem('filterMasterData');
            if (cachedFilters) {
                try {
                    setFilters(JSON.parse(cachedFilters));
                    setHasLoaded(true);
                    return;
                } catch (e) {
                    console.error('Error parsing cached filters:', e);
                    sessionStorage.removeItem('filterMasterData');
                }
            }

            setLoadingFilters(true);
            try {
                const data = await filterMasterApi();
                const formattedFilters = formatMasterData(data);
                setFilters(formattedFilters);
                sessionStorage.setItem('filterMasterData', JSON.stringify(formattedFilters));
                setHasLoaded(true);
            } catch (error) {
                console.error('Failed to load filters:', error);
            } finally {
                setLoadingFilters(false);
            }
        };

        if (isOpen && !hasLoaded && !loadingFilters) {
            fetchFilters();
        }
    }, [isOpen, hasLoaded, loadingFilters]);

    const filterLookup = useMemo(() => {
        const map = new Map();
        filters.forEach(cat => {
            cat.items.forEach(item => {
                map.set(`${cat.name}-${item.id}`, `${cat.name}-${item.id}`);
                if (item.name) {
                    map.set(`${cat.name}-${item.name.toLowerCase().trim()}`, `${cat.name}-${item.id}`);
                }
                if (item.value) {
                    map.set(`${cat.name}-${item.value.toLowerCase().trim()}`, `${cat.name}-${item.id}`);
                }
            });
        });
        return map;
    }, [filters]);

    useEffect(() => {
        if (isOpen) {
            setShouldRenderFilters(false);
            const timer = setTimeout(() => {
                setShouldRenderFilters(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShouldRenderFilters(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const newSelected = new Set();

        appliedFilters.forEach(({ category, item }) => {
            const idKey = `${category}-${item.id}`;

            if (filterLookup.has(idKey)) {
                newSelected.add(filterLookup.get(idKey));
            } else {
                const nameKey = `${category}-${(item.name || item.value || "").toLowerCase().trim()}`;
                if (filterLookup.has(nameKey)) {
                    newSelected.add(filterLookup.get(nameKey));
                } else {
                    newSelected.add(idKey);
                }
            }
        });
        setSelectedFilters(newSelected);
    }, [isOpen, filterLookup, appliedFilters]);

    const toggleRangeAccordion = (field) => {
        setExpandedRanges(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const toggleAccordion = useCallback((toggledCategory) => {
        setFilters(prev => {
            return prev.map(category => {
                if (category.name === toggledCategory.name) {
                    return { ...category, expanded: !category.expanded };
                }
                return { ...category, expanded: false }; // Close other accordions
            });
        });
    }, []);

    const toggleFilterItem = useCallback((categoryName, item, e) => {
        e.stopPropagation();
        const key = `${categoryName}-${item.id}`;
        const next = new Set(selectedFilters);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        setSelectedFilters(next);
        startTransition(() => {
            const drawerFilters = [];
            const drawerCategoryNames = new Set(filters.map(c => c.name));

            // Re-calculate all current filters
            // 1. Preserve non-drawer and range filters
            const rangeFields = rangeConfigs.map(c => c.field);
            const preservedFilters = appliedFilters.filter(
                (f) => !drawerCategoryNames.has(f.category) && !rangeFields.includes(f.category)
            );

            // 2. Add current drawer filters
            filters.forEach(cat => {
                cat.items.forEach(it => {
                    if (next.has(`${cat.name}-${it.id}`)) {
                        drawerFilters.push({ category: cat.name, item: it });
                    }
                });
            });

            // 3. Add current range filters
            rangeFields.forEach(field => {
                const existingRange = appliedFilters.find(f => f.category === field);
                if (existingRange) {
                    drawerFilters.push(existingRange);
                }
            });

            const allAppliedFilters = [...preservedFilters, ...drawerFilters];
            onApply?.(allAppliedFilters);
        });
    }, [filters, appliedFilters, onApply, selectedFilters]);

    const handleRangeChange = useCallback((field, [min, max]) => {
        startTransition(() => {
            const rangeItem = { id: `range-${field}`, min, max, isRange: true };
            const nextApplied = appliedFilters.filter(f => f.category !== field);
            nextApplied.push({ category: field, item: rangeItem });
            onApply?.(nextApplied);
        });
    }, [appliedFilters, onApply]);

    const rangeConfigs = useMemo(() => {
        if (!productData || productData.length === 0) return [];

        const fields = [
            { field: 'MetalWeight', label: 'Metal Weight', unit: 'Gms' },
            { field: 'ActualGrossweight', label: 'Gross Weight', unit: 'Gms' },
            { field: 'diamondpcs', label: 'Diamond Pcs', unit: 'Pcs' },
            { field: 'diamondctw', label: 'Diamond Ctw', unit: 'Ctw' }
        ];

        return fields.map(cfg => {
            const values = productData.map(p => Number(p[cfg.field])).filter(v => !isNaN(v));
            const minV = values.length ? Math.min(...values) : 0;
            const maxV = values.length ? Math.max(...values) : 100;

            return {
                ...cfg,
                min: cfg.field.includes('pcs') ? Math.floor(minV) : parseFloat(minV.toFixed(2)),
                max: cfg.field.includes('pcs') ? Math.ceil(maxV) : parseFloat(maxV.toFixed(2))
            };
        });
    }, [productData]);

    const getRangeValue = (field, minDefault, maxDefault) => {
        const found = appliedFilters.find(f => f.category === field);
        if (found && found.item && found.item.isRange) {
            return [found.item.min, found.item.max];
        }
        return [minDefault, maxDefault];
    };

    const filteredFilters = useMemo(() => {
        if (!debouncedSearchTerm) {
            return filters;
        }

        const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();

        return filters
            .map(category => {
                const filteredItems = category.items.filter(item =>
                    item.name.toLowerCase().includes(lowercasedSearchTerm)
                );

                const categoryNameMatches = category.name.toLowerCase().includes(lowercasedSearchTerm);

                if (categoryNameMatches || filteredItems.length > 0) {
                    return {
                        ...category,
                        items: categoryNameMatches ? category.items : filteredItems
                    };
                }
                return null;
            })
            .filter(Boolean);
    }, [filters, debouncedSearchTerm]);

    const focusableIds = useMemo(() => {
        const ids = [];
        filteredFilters?.forEach((category) => {
            ids.push(`cat:${category.name}`);
            if (category.expanded) {
                category.items?.forEach((item) => {
                    ids.push(`item:${category.name}:${item.id}`);
                });
            }
        });
        return ids;
    }, [filteredFilters]);

    useEffect(() => {
        if (!isOpen) return;
        if (pendingFocusIdRef.current && focusableIds.includes(pendingFocusIdRef.current)) {
            shouldProgrammaticallyFocusRef.current = true;
            setFocusedId(pendingFocusIdRef.current);
            pendingFocusIdRef.current = null;
            return;
        }

        if (!focusedId || !focusableIds.includes(focusedId)) {
            if (focusableIds.length > 0) {
                shouldProgrammaticallyFocusRef.current = true;
                setFocusedId(focusableIds[0]);
            }
        }
    }, [isOpen, focusableIds, focusedId]);

    useEffect(() => {
        if (!isOpen) return;
        if (!focusedId) return;
        if (!shouldProgrammaticallyFocusRef.current) return;
        const el = focusablesRef.current.get(focusedId);
        if (el && typeof el.focus === 'function') {
            el.focus();
        }
        shouldProgrammaticallyFocusRef.current = false;
    }, [isOpen, focusedId]);

    const focusById = useCallback((id) => {
        if (!id) return;
        shouldProgrammaticallyFocusRef.current = true;
        setFocusedId(id);
    }, []);

    const moveFocus = useCallback((delta) => {
        if (!focusableIds.length) return;
        const currentIndex = focusedId ? focusableIds.indexOf(focusedId) : -1;
        const safeIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex = Math.max(0, Math.min(focusableIds.length - 1, safeIndex + delta));
        focusById(focusableIds[nextIndex]);
    }, [focusableIds, focusedId, focusById]);

    const onFocusFocusable = useCallback((id) => {
        setFocusedId(id);
    }, []);

    const onKeyDownFocusable = useCallback((e, payload) => {
        if (!payload) return;
        const key = e.key;

        if (key === 'Escape') {
            e.preventDefault();
            onClose?.();
            return;
        }

        if (key === 'ArrowDown') {
            e.preventDefault();
            moveFocus(1);
            return;
        }

        if (key === 'ArrowUp') {
            e.preventDefault();
            moveFocus(-1);
            return;
        }

        if (payload.kind === 'category') {
            const headerId = payload.id;

            if (key === 'Enter' || key === ' ') {
                e.preventDefault();
                const willExpand = !payload.category.expanded;
                toggleAccordion(payload.category);
                if (willExpand && payload.category.items?.length) {
                    pendingFocusIdRef.current = `item:${payload.category.name}:${payload.category.items[0].id}`;
                }
                return;
            }

            if (key === 'ArrowRight') {
                e.preventDefault();
                if (!payload.category.expanded) {
                    toggleAccordion(payload.category);
                }
                if (payload.category.items?.length) {
                    pendingFocusIdRef.current = `item:${payload.category.name}:${payload.category.items[0].id}`;
                }
                return;
            }

            if (key === 'ArrowLeft') {
                e.preventDefault();
                if (payload.category.expanded) {
                    toggleAccordion(payload.category);
                    focusById(headerId);
                }
                return;
            }
        }

        if (payload.kind === 'item') {
            if (key === 'Enter' || key === ' ') {
                e.preventDefault();
                toggleFilterItem(payload.category.name, payload.item, { stopPropagation: () => { } });
                return;
            }

            if (key === 'ArrowLeft') {
                e.preventDefault();
                focusById(`cat:${payload.category.name}`);
                return;
            }
        }
    }, [focusById, moveFocus, onClose, toggleAccordion, toggleFilterItem]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleClearAll = useCallback(() => {
        const next = new Set();
        setSelectedFilters(next);
        startTransition(() => {
            const drawerCategoryNames = new Set(filters.map(c => c.name));
            const rangeFields = rangeConfigs.map(c => c.field);
            const preservedFilters = appliedFilters.filter(
                (f) => !drawerCategoryNames.has(f.category) && !rangeFields.includes(f.category)
            );
            onApply?.(preservedFilters);
        });
    }, [appliedFilters, filters, onApply, rangeConfigs]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            const updatedFilters = filters.map(category => {
                const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
                const categoryNameMatches = category.name.toLowerCase().includes(lowercasedSearchTerm);
                const filteredItems = category.items.filter(item =>
                    item.name.toLowerCase().includes(lowercasedSearchTerm)
                );

                if (!categoryNameMatches && filteredItems.length > 0) {
                    return { ...category, expanded: true };
                }
                return category;
            });
            setFilters(updatedFilters);
        }
    }, [debouncedSearchTerm]);

    const categoryCounts = useMemo(() => {
        const counts = {};
        selectedFilters.forEach(key => {
            const category = key.split('-')[0];
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }, [selectedFilters]);

    return (
        <>
            {/* Sidebar Panel */}
            <Box
                className={`filterSidebar ${isOpen ? 'filterSidebar--open' : ''}`}
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: isMobile ? '100%' : '320px',
                    bgcolor: 'background.paper',
                    boxShadow: isOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transition: 'transform 0.4s cubic-bezier(0.86, 0, 0.07, 1), opacity 0.4s cubic-bezier(0.86, 0, 0.07, 1), visibility 0.4s, box-shadow 0.4s cubic-bezier(0.86, 0, 0.07, 1)',
                    zIndex: 1200,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'hidden',
                }}
            >
                {/* Header */}
                <Box className="filterSidebar__header" sx={{
                    p: '8px 16px',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Filters</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {selectedFilters.size} items selected
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {selectedFilters.size > 0 && (
                            <Button
                                size="small"
                                onClick={handleClearAll}
                                sx={{ minWidth: 'auto', padding: '4px 8px' }}
                            >
                                Clear
                            </Button>
                        )}
                        <IconButton onClick={onClose} size="small" sx={{ padding: '8px' }}>
                            <X size={20} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Search */}
                <Box sx={{ p: '8px 16px', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Search filters..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} color="gray" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Content */}
                <Box className="filterSidebar__content" sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2
                }}>
                    {/* Individual Range Filter Accordions */}
                    {isOpen && rangeConfigs.map(cfg => (
                        <Accordion
                            key={cfg.field}
                            expanded={!!expandedRanges[cfg.field]}
                            onChange={() => toggleRangeAccordion(cfg.field)}
                            disableGutters
                            className="filterSidebar__accordion"
                            sx={{
                                boxShadow: 'none',
                                '&:before': { display: 'none' },
                                mb: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '8px !important',
                                overflow: 'hidden',
                                '&.MuiAccordionSummary-content': { margin: '8px 0px !important' },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ChevronDown size={18} />}
                                sx={{
                                    bgcolor: expandedRanges[cfg.field] ? 'background.light' : 'background.paper',
                                    outline: 'none',
                                    '&.Mui-expanded': { minHeight: 40 }
                                }}
                            >
                                <Typography className="filterSidebar__title">
                                    {cfg.label}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails className="filterSidebar__details" sx={{ p: 1, pt: 1 }}>
                                <RangeFilter
                                    label={cfg.label}
                                    field={cfg.field}
                                    min={cfg.min}
                                    max={cfg.max}
                                    value={getRangeValue(cfg.field, cfg.min, cfg.max)}
                                    onChange={handleRangeChange}
                                    unit={cfg.unit}
                                />
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    {!shouldRenderFilters || (loadingFilters && !hasLoaded) ? (
                        <Box>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Box key={`skeleton-${index}`} sx={{ mb: 2 }}>
                                    <Skeleton variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        filteredFilters?.map((category, index) => (
                            <FilterCategory
                                key={`${category.name}-${index}`}
                                category={category}
                                index={index}
                                expanded={category.expanded}
                                onToggleAccordion={toggleAccordion}
                                selectedFilters={selectedFilters}
                                onToggleItem={toggleFilterItem}
                                count={categoryCounts[category.name] || 0}
                                categoryFocusId={focusedId && (focusedId === `cat:${category.name}` || focusedId.startsWith(`item:${category.name}:`)) ? focusedId : null}
                                registerFocusable={registerFocusable}
                                onFocusFocusable={onFocusFocusable}
                                onKeyDownFocusable={onKeyDownFocusable}
                            />
                        ))
                    )}
                </Box>
            </Box>
        </>
    );
}

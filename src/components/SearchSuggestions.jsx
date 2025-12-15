"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Fade } from "@mui/material";
import {
    Layers,
    Package,
    Award,
    Palette,
    Sparkles,
    Tag,
    Hash,
    Users,
    Shapes,
    PartyPopper,
    Gem,
    GitBranch
} from "lucide-react";
import "../Style/SearchSuggestions.scss";

const SUGGESTION_ICONS = {
    category: Layers,
    collection: Package,
    brand: Award,
    metaltype: Palette,
    metalcolor: Sparkles,
    design: Hash,
    default: Tag,
    gender: Users,
    style: Shapes,
    occasion: PartyPopper,
    producttype: Gem,
    subcategory: GitBranch,
};

const SearchSuggestions = ({
    suggestions = [],
    onSuggestionClick,
    isVisible = false,
    searchTerm = "",
    suggestionPosition = 'bottom',
    onHighlightChange = () => { }
}) => {
    const [urlParamsFlag, setUrlParamsFlag] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const suggestionRefs = useRef([]);
    const containerRef = useRef(null);

    // Flatten suggestions for keyboard navigation
    const flatSuggestions = suggestions;

    useEffect(() => {
        const flag = sessionStorage.getItem("urlParams");
        setUrlParamsFlag(flag);
    }, []);

    useEffect(() => {
        setSelectedIndex(-1);
    }, [suggestions]);

    useEffect(() => {
        if (onHighlightChange) {
            onHighlightChange(selectedIndex);
        }
    }, [selectedIndex, onHighlightChange]);

    useEffect(() => {
        if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex] && containerRef.current) {
            // Use requestAnimationFrame to batch scroll updates
            const scrollToSelected = () => {
                const selectedElement = suggestionRefs.current[selectedIndex];
                const container = containerRef.current;

                if (!selectedElement || !container) return;

                const containerRect = container.getBoundingClientRect();
                const elementRect = selectedElement.getBoundingClientRect();

                const elementTop = elementRect.top - containerRect.top + container.scrollTop;
                const elementBottom = elementTop + selectedElement.offsetHeight;
                const containerScrollTop = container.scrollTop;
                const containerScrollBottom = containerScrollTop + container.clientHeight;

                const padding = 40;

                if (elementTop < containerScrollTop + padding) {
                    container.scrollTo({
                        top: Math.max(0, elementTop - padding),
                        behavior: 'smooth'
                    });
                } else if (elementBottom > containerScrollBottom - padding) {
                    container.scrollTo({
                        top: elementBottom - container.clientHeight + padding,
                        behavior: 'smooth'
                    });
                }
            };

            // Batch scroll updates using RAF
            requestAnimationFrame(scrollToSelected);
        }
    }, [selectedIndex]);

    // Handle keyboard navigation
    const lastKeyTime = useRef(0);
    const stateRef = useRef({ selectedIndex, flatSuggestions, onSuggestionClick });

    // Keep state ref updated
    useEffect(() => {
        stateRef.current = { selectedIndex, flatSuggestions, onSuggestionClick };
    }, [selectedIndex, flatSuggestions, onSuggestionClick]);

    useEffect(() => {
        if (!isVisible) return;
        const handleKeyDown = (e) => {
            const now = Date.now();
            const { selectedIndex, flatSuggestions, onSuggestionClick } = stateRef.current;
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                if (now - lastKeyTime.current < 50) {
                    return;
                }
                lastKeyTime.current = now;
                if (e.key === 'ArrowDown') {
                    setSelectedIndex(prev =>
                        prev < flatSuggestions.length - 1 ? prev + 1 : prev
                    );
                } else if (e.key === 'ArrowUp') {
                    setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                }
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const suggestion = flatSuggestions[selectedIndex];
                if (suggestion && onSuggestionClick) {
                    onSuggestionClick(suggestion);
                }
            } else if (e.key === 'Escape') {
                setSelectedIndex(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible]);

    if (!isVisible || suggestions.length === 0) {
        return null;
    }

    // Group suggestions by type
    const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
        const type = suggestion.type || 'default';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(suggestion);
        return acc;
    }, {});

    const getCategoryLabel = (type) => {
        const labels = {
            collection: "Collections",
            category: "Categories",
            subcategory: "Subcategories",
            brand: "Brands",
            metaltype: "Metal Types",
            metalcolor: "Metal Colors",
            design: "Design#",
            gender: "Gender",
            style: "Style",
            occasion: "Occasions",
            producttype: "Product Types",
            default: "Suggestions"
        };
        return labels[type] || "Suggestions";
    };

    const handleClick = (suggestion) => {
        if (onSuggestionClick) {
            onSuggestionClick(suggestion);
        }
    };

    let globalIndex = 0;

    const groupCount = Object.keys(groupedSuggestions).length;
    const hasMultipleGroups = groupCount > 1;
    const isTwoGroups = groupCount === 2;
    const isThreeGroups = groupCount === 3;

    return (
        <Fade in={isVisible} timeout={200}>
            <Paper
                ref={containerRef}
                className={`search-suggestions-container ${suggestionPosition === 'top' ? 'position-top' : ''}`}
                sx={{
                    maxHeight: urlParamsFlag && urlParamsFlag?.toLowerCase() === 'fe' ? '270px' : "350px",
                }}
                elevation={8}
            >
                <Box className={`suggestions-grid ${isThreeGroups ? 'three-groups' : isTwoGroups ? 'two-groups' : !hasMultipleGroups ? 'single-group' : ''}`}>
                    {Object.entries(groupedSuggestions).map(([type, items]) => {
                        const IconComponent = SUGGESTION_ICONS[type] || SUGGESTION_ICONS.default;

                        return (
                            <Box key={type} className={`suggestion-group group-${type} ${type === 'design' && items.length > 5 ? 'two-column-grid' : ''}`}>
                                <Box className="suggestion-group-header">
                                    <IconComponent size={14} />
                                    <Typography variant="caption" className="suggestion-group-title">
                                        {getCategoryLabel(type)}
                                    </Typography>
                                </Box>

                                {items.map((suggestion, index) => {
                                    const currentGlobalIndex = globalIndex++;
                                    const isSelected = currentGlobalIndex === selectedIndex;

                                    return (
                                        <Box
                                            key={`${type}-${index}`}
                                            ref={el => suggestionRefs.current[currentGlobalIndex] = el}
                                            className={`suggestion-item item-${type} ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleClick(suggestion)}
                                        >
                                            <Typography
                                                variant="body2"
                                                className="suggestion-label"
                                            >
                                                {suggestion.label}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    })}
                </Box>
            </Paper>
        </Fade>
    );
};

export default SearchSuggestions;

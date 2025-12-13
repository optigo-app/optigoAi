"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Fade } from "@mui/material";
import {
    Layers,
    Package,
    Award,
    Palette,
    Sparkles,
    Tag
} from "lucide-react";
import "../Style/SearchSuggestions.scss";

const SUGGESTION_ICONS = {
    category: Layers,
    collection: Package,
    brand: Award,
    metaltype: Palette,
    metalcolor: Sparkles,
    default: Tag
};

const SearchSuggestions = ({
    suggestions = [],
    onSuggestionClick,
    isVisible = false,
    searchTerm = ""
}) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const suggestionRefs = useRef([]);
    const containerRef = useRef(null);

    // Flatten suggestions for keyboard navigation
    const flatSuggestions = suggestions;

    useEffect(() => {
        setSelectedIndex(-1);
    }, [suggestions]);

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

            // Throttle rapid keypresses for navigation only
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                // Prevent default scrolling immediately
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
    }, [isVisible]); // Stable dependency

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
            category: "Categories",
            collection: "Collections",
            brand: "Brands",
            metaltype: "Metal Types",
            metalcolor: "Metal Colors",
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

    return (
        <Fade in={isVisible} timeout={200}>
            <Paper
                ref={containerRef}
                className="search-suggestions-container"
                elevation={8}
                sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    zIndex: 1200,
                    maxHeight: "350px",
                    pb: "10px",
                    overflowY: "auto",
                    borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(115, 103, 240, 0.1)",
                    boxShadow: "0 8px 32px rgba(115, 103, 240, 0.15)",
                }}
            >
                {Object.entries(groupedSuggestions).map(([type, items]) => {
                    const IconComponent = SUGGESTION_ICONS[type] || SUGGESTION_ICONS.default;

                    return (
                        <Box key={type} className="suggestion-group">
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
                                        key={`${type} -${index} `}
                                        ref={el => suggestionRefs.current[currentGlobalIndex] = el}
                                        className="suggestion-item"
                                        onClick={() => handleClick(suggestion)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            padding: "10px 16px",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            borderRadius: "8px",
                                            margin: "0 8px 4px 8px",
                                            background: isSelected
                                                ? "linear-gradient(135deg, rgba(115, 103, 240, 0.15) 0%, rgba(162, 155, 254, 0.15) 100%)"
                                                : "transparent",
                                            transform: isSelected ? "translateX(4px)" : "translateX(0)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgba(115, 103, 240, 0.08) 0%, rgba(162, 155, 254, 0.08) 100%)",
                                                transform: "translateX(4px)",
                                            },
                                            "&:active": {
                                                transform: "translateX(2px) scale(0.98)",
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "8px",
                                                background: isSelected
                                                    ? "linear-gradient(135deg, rgba(115, 103, 240, 0.2) 0%, rgba(162, 155, 254, 0.2) 100%)"
                                                    : "linear-gradient(135deg, rgba(115, 103, 240, 0.1) 0%, rgba(162, 155, 254, 0.1) 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <IconComponent size={16} color="#7367f0" />
                                        </Box>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: isSelected ? 600 : 500,
                                                    color: "#2c3e50",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {suggestion.label}
                                            </Typography>
                                            {suggestion.count && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#94a3b8",
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    {suggestion.count} {suggestion.count === 1 ? 'item' : 'items'}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    );
                })}
            </Paper>
        </Fade>
    );
};

export default SearchSuggestions;

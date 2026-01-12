"use client";

import { useEffect, useState, useRef } from "react";
import {
    Box,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    ClickAwayListener,
    Button,
    Zoom,
    Chip,
    CircularProgress,
    Skeleton,
} from "@mui/material";
import {
    X,
    ArrowRight,
    ImagePlus,
    Settings2,
    Layers,
    Users,
    Check,
    Search,
    Filter
} from "lucide-react";
import "../Style/chatInput.scss";
import useCustomToast from "@/hook/useCustomToast";
import { filterMasterApi } from "@/app/api/filterMasterApi";
import { formatMasterData, getAuthData } from "@/utils/globalFunc";
import FilterDropdown from "./Product/FilterDropdown";
import SearchSuggestions from "./SearchSuggestions";
import DragDropOverlay from "./Common/DragDropOverlay";
import ImageEditorModal from "./Common/ImageEditorModal";
import { Pencil } from "lucide-react";

export default function ModernSearchBar({ onSubmit, onFilterClick, appliedFilters = [], onApply, isFilterOpen, initialExpanded = false, alwaysExpanded = false, showMoreFiltersButton = true, showSuggestions = false, productData = [], onSuggestionClick, autoFocus = false, suggestionPosition = 'bottom', externalLoading = false, isLoading = false, searchMode = 'ai', onImageUpload, onExpandChange }) {
    const { showSuccess, showError } = useCustomToast();
    const fileRef = useRef(null);
    const textFieldRef = useRef(null);
    const containerRef = useRef(null);
    const isInternalChangeRef = useRef(false);
    const [isExpanded, setIsExpanded] = useState(initialExpanded || alwaysExpanded);
    const isDesignMode = searchMode === 'design';

    useEffect(() => {
        if (onExpandChange) {
            onExpandChange(isExpanded);
        }
    }, [isExpanded, onExpandChange]);
    const actionIconButtonSx = {
        width: 40,
        height: 40,
        p: 1,
        borderRadius: '50%',
        color: 'text.secondary',
        bgcolor: 'rgba(115, 103, 240, 0.06)',
        transition: 'all 0.2s ease',
        '&:hover': {
            bgcolor: 'rgba(115, 103, 240, 0.12)',
            color: 'primary.main',
        },
    };

    const sendIconButtonSx = {
        ...actionIconButtonSx,
        bgcolor: 'primary.main',
        color: '#ffffff',
        '&:hover': {
            bgcolor: 'primary.dark',
            color: '#ffffff',
        },
    };

    // Original State
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [text, setText] = useState("");
    const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
    const [isDraggingLocal, setIsDraggingLocal] = useState(false);
    const [isDragging, setIsDragging] = useState(false); // Legacy or for general use if needed
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const [isMultiline, setIsMultiline] = useState(false);

    // Filter Logic States
    const [filterData, setFilterData] = useState([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [hasLoadedFilters, setHasLoadedFilters] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const isCatalogLoading = Boolean(externalLoading || isLoadingFilters);

    // Suggestion States
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
    const [debouncedText, setDebouncedText] = useState("");
    const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);

    // Initialize Settings
    const [numResults, setNumResults] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('searchNumResults');
            return saved ? Number(saved) || 200 : 200;
        }
        return 100;
    });

    const [accuracy, setAccuracy] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('searchAccuracy');
            return saved ? parseInt(saved, 10) : 40;
        }
        return 40;
    });

    useEffect(() => {
        sessionStorage.setItem('searchNumResults', numResults.toString());
    }, [numResults]);

    useEffect(() => {
        sessionStorage.setItem('searchAccuracy', accuracy.toString());
    }, [accuracy]);

    useEffect(() => {
        if (autoFocus && textFieldRef.current) {
            const timer = setTimeout(() => {
                textFieldRef.current.focus();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoFocus]);

    // Debounce text input for suggestions
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedText(text);
        }, 300);
        return () => clearTimeout(timer);
    }, [text]);

    useEffect(() => {
        if (!showSuggestions || !debouncedText.trim() || debouncedText.trim().length < 2 || searchMode === 'ai') {
            setSuggestions(prev => prev.length > 0 ? [] : prev);
            setShowSuggestionsDropdown(prev => prev ? false : prev);
            return;
        }
        const searchTerm = debouncedText.trim().toLowerCase();
        const suggestionMap = new Map();

        // Optimized Search Configuration
        const SEARCH_FIELDS = [
            { key: 'categoryname', type: 'category', filterCategory: 'Category' },
            { key: 'subcategoryname', type: 'subcategory', filterCategory: 'Subcategory' },
            { key: 'collectionname', type: 'collection', filterCategory: 'Collection' },
            { key: 'brandname', type: 'brand', filterCategory: 'Brand' },
            { key: 'metaltype', type: 'metaltype', filterCategory: 'Metal' },
            { key: 'metalcolor', type: 'metalcolor', filterCategory: 'Metal Color' },
            { key: 'gendername', type: 'gender', filterCategory: 'Gender' },
            { key: 'stylename', type: 'style', filterCategory: 'Style' },
            { key: 'occasionname', type: 'occasion', filterCategory: 'Occasion' },
            { key: 'producttype', type: 'producttype', filterCategory: 'Product Type' }
        ];

        productData.forEach(product => {
            SEARCH_FIELDS.forEach(field => {
                const val = product[field.key];
                if (val && typeof val === 'string') {
                    const lowerVal = val.toLowerCase();
                    if (lowerVal.startsWith(searchTerm)) {
                        const key = `${field.type}-${val}`;
                        if (!suggestionMap.has(key)) {
                            // Since we are forcing startsWith, relevance is always high for prefix match
                            suggestionMap.set(key, {
                                type: field.type,
                                label: val,
                                value: val,
                                filterCategory: field.filterCategory,
                                count: 1,
                                relevanceScore: 100
                            });
                        } else {
                            suggestionMap.get(key).count++;
                        }
                    }
                }
            });
        });

        if (searchTerm.length >= 2) {
            const designMatches = productData
                .filter(p => p.designno && p.designno.toLowerCase().includes(searchTerm))
                .slice(0, 20); // Get more to find better prefix matches first

            designMatches.forEach(p => {
                const lowerNo = p.designno.toLowerCase();
                const score = lowerNo.startsWith(searchTerm) ? 100 : 10;
                const key = `design-${p.designno}`;
                if (!suggestionMap.has(key)) {
                    suggestionMap.set(key, {
                        type: 'design',
                        label: p.designno,
                        value: p.designno,
                        name: p.designno,
                        filterCategory: 'Design#',
                        category: p.categoryname,
                        id: p.id,
                        count: 1,
                        relevanceScore: score
                    });
                }
            });
        }

        // Final score = relevanceScore + (count / 100) to keep relevance as primary
        const suggestionArray = Array.from(suggestionMap.values()).map(item => ({
            ...item,
            totalScore: item.relevanceScore + (item.count / 1000)
        }));

        // Group by type
        const groupedByType = suggestionArray.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        // Sort each group and find the max score per group for group priority
        const groupPriorities = {};
        Object.keys(groupedByType).forEach(type => {
            groupedByType[type].sort((a, b) => b.totalScore - a.totalScore);
            groupPriorities[type] = Math.max(...groupedByType[type].map(i => i.totalScore));
        });

        // Flatten back while keeping the most relevant groups first
        const finalSuggestions = Object.keys(groupedByType)
            .sort((a, b) => groupPriorities[b] - groupPriorities[a])
            .flatMap(type => groupedByType[type].slice(0, 5));

        setSuggestions(finalSuggestions);
        setShowSuggestionsDropdown(finalSuggestions.length > 0);
    }, [debouncedText, productData, showSuggestions, searchMode]);

    useEffect(() => {
        let timeoutId;
        let isMounted = true;

        const fetchFilters = async () => {
            if (!isMounted) return;

            const cachedFilters = sessionStorage.getItem('filterMasterData');
            if (cachedFilters) {
                try {
                    setFilterData(JSON.parse(cachedFilters));
                    setHasLoadedFilters(true);
                    return;
                } catch (e) {
                    sessionStorage.removeItem('filterMasterData');
                }
            }

            setIsLoadingFilters(true);
            try {
                const data = await filterMasterApi();
                const formatted = formatMasterData(data);
                if (!isMounted) return;
                setFilterData(formatted);
                setHasLoadedFilters(true);
                if (Array.isArray(formatted) && formatted.length > 0) {
                    sessionStorage.setItem('filterMasterData', JSON.stringify(formatted));
                }
            } catch (err) {
                console.error("Failed to load search filters", err);
            } finally {
                if (isMounted) {
                    setIsLoadingFilters(false);
                    setHasLoadedFilters(true);
                }
            }
        };

        const waitForAuthAndFetch = () => {
            if (!isMounted) return;
            const auth = getAuthData();
            if (auth && auth.uid) {
                fetchFilters();
            } else {
                timeoutId = setTimeout(waitForAuthAndFetch, 500);
            }
        };

        waitForAuthAndFetch();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    const getItemsForCategory = (categoryName) => {
        let target = categoryName;
        if (categoryName === 'Category') target = 'Category';
        if (categoryName === 'Gender') target = 'Gender';

        const found = filterData.find(c =>
            c.name.toLowerCase().includes(target.toLowerCase())
        );
        return found ? found.items : [];
    };

    const handleUpload = (e) => {
        isInternalChangeRef.current = true;
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setIsExpanded(true);
        if (onImageUpload) onImageUpload(file);
    };

    const handleSaveEditedImage = (editedFile) => {
        if (!editedFile) return;
        const newUrl = URL.createObjectURL(editedFile);

        // Revoke old url to prevent memory leaks if it was created by us
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setImageFile(editedFile);
        setImagePreview(newUrl);
        if (onImageUpload) onImageUpload(editedFile);
    };

    const handlePaste = (e) => {
        for (const item of e.clipboardData.items) {
            if (item.type.startsWith("image/")) {
                isInternalChangeRef.current = true;
                const file = item.getAsFile();
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                setIsExpanded(true);
                if (onImageUpload) onImageUpload(file);
            }
        }
    };

    const processDroppedFiles = (files) => {
        isInternalChangeRef.current = true;
        const fileList = Array.from(files || []);
        const image = fileList.find((file) => file.type.startsWith("image/"));

        if (!image) {
            if (fileList.length) {
                showError("Please drop an image file", "warning");
            }
            return;
        }

        setImageFile(image);
        setImagePreview(URL.createObjectURL(image));
        if (fileRef.current) {
            fileRef.current.value = "";
        }

        setIsDragging(false);
        setIsExpanded(true);
        if (onImageUpload) onImageUpload(image);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        processDroppedFiles(e.dataTransfer?.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const resetDragStates = () => {
        setIsDraggingGlobal(false);
        setIsDraggingLocal(false);
        setIsDragging(false);
    };

    useEffect(() => {
        const handleWindowDragOver = (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "copy";
            }
            if (!isDesignMode) {
                setIsDraggingGlobal(true);
            }
        };

        const handleWindowDragLeave = (e) => {
            e.preventDefault();
            // relatedTarget is null when leaving the window
            if (!e.relatedTarget) {
                resetDragStates();
            }
        };

        const handleWindowDrop = (e) => {
            e.preventDefault();
            resetDragStates();
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                resetDragStates();
            }
        };

        window.addEventListener("dragover", handleWindowDragOver);
        window.addEventListener("dragleave", handleWindowDragLeave);
        window.addEventListener("drop", handleWindowDrop);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("dragover", handleWindowDragOver);
            window.removeEventListener("dragleave", handleWindowDragLeave);
            window.removeEventListener("drop", handleWindowDrop);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [imagePreview, isDesignMode]);

    useEffect(() => {
        if (isInternalChangeRef.current) {
            isInternalChangeRef.current = false;
            return;
        }
        // If mode changed externally (manual toggle), clear image
        setImageFile(null);
        setImagePreview(null);
        if (fileRef.current) {
            fileRef.current.value = "";
        }
    }, [searchMode]);

    const handleSend = (forceCatalogRequested = false) => {
        const forceCatalog = forceCatalogRequested === true;
        if (isCatalogLoading) return;
        const trimmedText = text.trim();

        // Allow empty search - just navigate to product page
        let isSearchFlag = 0;
        if (trimmedText && imageFile) {
            isSearchFlag = 3; // Hybrid
        } else if (imageFile) {
            isSearchFlag = 2; // Image
        } else if (trimmedText) {
            isSearchFlag = 1; // Text
        }
        // isSearchFlag = 0 means no search, just navigate

        const searchData = {
            text: forceCatalog ? "" : trimmedText,
            image: forceCatalog ? null : imageFile,
            isSearchFlag: forceCatalog ? 0 : isSearchFlag,
            numResults,
            accuracy,
        };

        onSubmit(searchData);
        clearInput();
        if (!alwaysExpanded) setIsExpanded(false);
        setIsMultiline(false);
    };

    const clearInput = () => {
        setText("");
        setImageFile(null);
        setImagePreview(null);
        setIsMultiline(false);
        if (fileRef.current) {
            fileRef.current.value = "";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && e.shiftKey) return;

        if (e.key === "Enter" && highlightedSuggestionIndex === -1) {
            e.preventDefault();
            handleSend();
        }
    };

    const openDropdown = (type, event) => {
        setActiveDropdown(type);
        setAnchorEl(event.currentTarget);
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
        setAnchorEl(null);
    };

    const handleFilterSelect = (category, item) => {
        if (!onApply) return;
        const isCurrentlySelected = appliedFilters.some(f => f.item.id === item.id && f.category === category);
        let newFilters = appliedFilters.filter(f => f.category !== category);
        if (!isCurrentlySelected) {
            newFilters.push({ category, item });
        }
        onApply(newFilters);
        closeDropdown();
    };

    const handleClickAway = () => {
        if (alwaysExpanded) return;
        closeDropdown();
        setIsExpanded(false);
        setIsMultiline(false);
        setShowSuggestionsDropdown(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setShowSuggestionsDropdown(false);
        setText("");
        if (onSuggestionClick) {
            onSuggestionClick(suggestion);
        }
    };

    const handleFocus = () => {
        setIsExpanded(true);
    };

    const getActiveFilterName = (category) => {
        const found = appliedFilters.find(f => f.category === category);
        return found ? found.item.name : category;
    };

    const hasSelection = (category) => {
        return appliedFilters.some(f => f.category === category);
    };

    return (
        <>
            <ClickAwayListener onClickAway={handleClickAway}>
                <Box sx={{ position: 'relative', width: '100%' }}>
                    <DragDropOverlay
                        isDraggingGlobal={isDraggingGlobal}
                        isDraggingLocal={isDraggingLocal}
                        onClose={resetDragStates}
                        onDrop={(e) => {
                            handleDrop(e);
                        }}
                        onDragOver={(e) => {
                            if (!isDesignMode) {
                                setIsDraggingGlobal(true);
                            }
                        }}
                        onDragEnter={(e) => {
                            if (!isDesignMode) {
                                setIsDraggingLocal(true);
                            }
                        }}
                        onDragLeave={(e) => {
                            setIsDraggingLocal(false);
                        }}
                    />
                    <Paper
                        ref={containerRef}
                        elevation={isExpanded ? 12 : 2}
                        className={`chat-input-container ${isExpanded ? 'expanded' : 'minimized'}`}
                        onPaste={handlePaste}
                        onDrop={(e) => {
                            handleDrop(e);
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (!isDesignMode) {
                                setIsDraggingLocal(true);
                                setIsDraggingGlobal(true);
                            }
                        }}
                        onDragEnter={(e) => {
                            e.preventDefault();
                            if (!isDesignMode) {
                                setIsDraggingLocal(true);
                            }
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            // Only hide if we're moving outside the container
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setIsDraggingLocal(false);
                            }
                        }}
                        sx={{
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: isExpanded ? 1100 : 1,
                        }}
                    >
                        {/* Top Section: Inputs & Controls */}
                        <Box className="input-area-wrapper">
                            {imagePreview && (
                                <Zoom in={Boolean(imagePreview)}>
                                    <Box className="image-preview-wrapper" sx={{ mb: 1 }}>
                                        <Box className="image-preview" onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditorOpen(true);
                                        }}>
                                            <img src={imagePreview} alt="preview" />
                                            <IconButton
                                                size="small"
                                                className="remove-image"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImagePreview(null);
                                                    setImageFile(null);
                                                }}
                                            >
                                                <X size={16} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                className="edit-image"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditorOpen(true);
                                                }}
                                            >
                                                <Pencil size={16} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Zoom>
                            )}

                            <Box className="input-flex-row">
                                {/* Upload Icon */}
                                {!isMultiline && (
                                    <Tooltip title={isDesignMode ? "" : "Upload image"}>
                                        <span>
                                            <IconButton
                                                className="iconbuttonsearch"
                                                disabled={isDesignMode}
                                                onClick={() => {
                                                    if (!isDesignMode) {
                                                        fileRef.current.click();
                                                    }
                                                }}
                                                sx={{
                                                    ...actionIconButtonSx,
                                                    cursor: isDesignMode ? "not-allowed" : "pointer",
                                                    "&:hover": {
                                                        backgroundColor: isDesignMode ? "transparent" : undefined
                                                    }
                                                }}
                                            >
                                                {isDesignMode ? <Search size={20} /> : <ImagePlus size={22} />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                )}

                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleUpload}
                                />

                                <TextField
                                    placeholder={isDesignMode ? "Search your jewelry designs..." : "Describe your idea, and I'll bring it to life"}
                                    variant="standard"
                                    fullWidth
                                    multiline
                                    maxRows={8}
                                    value={text}
                                    onClick={handleFocus}
                                    onFocus={handleFocus}
                                    onChange={(e) => {
                                        setText(e.target.value);
                                        if (e.target.value.includes('\n') || e.target.value.length > 50) {
                                            setIsMultiline(true);
                                        } else {
                                            setIsMultiline(false);
                                        }
                                    }}
                                    onKeyDown={handleKeyDown}
                                    className="chat-textarea"
                                    inputRef={textFieldRef}
                                    InputProps={{
                                        disableUnderline: true,
                                        sx: { fontSize: '1.05rem' }
                                    }}
                                />

                                {!isExpanded && (
                                    <Tooltip title="Maximize">
                                        <IconButton className="iconbuttonsearch" onClick={() => setIsExpanded(true)} sx={{ ...actionIconButtonSx, ml: 1 }}>
                                            <Settings2 size={20} />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {/* Actions Group - Inline */}
                                {(isExpanded && !isMultiline) && (
                                    <Zoom in={isExpanded || text.length > 0 || Boolean(imagePreview)}>
                                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                            <Tooltip title={isExpanded ? "Minimize" : "Maximize"}>
                                                <IconButton
                                                    size="small"
                                                    className="iconbuttonsearch"
                                                    onClick={() => setIsExpanded(!isExpanded)}
                                                    sx={{
                                                        ...actionIconButtonSx,
                                                        mr: 0.5
                                                    }}
                                                >
                                                    <Settings2 size={20} />
                                                </IconButton>
                                            </Tooltip>

                                            <IconButton className="iconbuttonsearch" onClick={() => handleSend(false)} sx={sendIconButtonSx} disabled={isCatalogLoading || isLoading}>
                                                {(isLoading && !isDesignMode) ? <CircularProgress size={20} color="inherit" thickness={5} /> : <ArrowRight size={20} />}
                                            </IconButton>
                                        </Box>
                                    </Zoom>
                                )}
                            </Box>

                            {/* Multiline Bottom Actions Row */}
                            {isMultiline && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                                    <Tooltip title="Upload image">
                                        <IconButton
                                            className="iconbuttonsearch"
                                            onClick={() => fileRef.current.click()}
                                            sx={actionIconButtonSx}
                                        >
                                            <ImagePlus size={20} />
                                        </IconButton>
                                    </Tooltip>

                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Tooltip title={isExpanded ? "Minimize" : "Expand"}>
                                            <IconButton
                                                size="small"
                                                className="iconbuttonsearch"
                                                onClick={() => setIsExpanded(!isExpanded)}
                                                sx={actionIconButtonSx}
                                            >
                                                <Settings2 size={20} />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="AI Search" placement="top">
                                            <IconButton
                                                className="iconbuttonsearch"
                                                onClick={() => handleSend(false)}
                                                sx={sendIconButtonSx}
                                                disabled={isCatalogLoading || isLoading}
                                            >
                                                {(isLoading && !isDesignMode) ? (
                                                    <CircularProgress size={20} color="inherit" thickness={5} />
                                                ) : isDesignMode ? (
                                                    <ArrowRight size={20} />
                                                ) : (
                                                    <Box component="img" src="/icons/sendBtn.png" sx={{ width: 22, height: 22, objectFit: 'contain' }} />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Bottom Section: expanded filters */}
                        <Box
                            className="expanded-content"
                            sx={{
                                display: (isExpanded && !isDesignMode) ? 'none' : isExpanded ? 'flex' : 'none',
                                opacity: (isExpanded && !isDesignMode) ? 0 : isExpanded ? 1 : 0,
                                flexDirection: 'column',
                                gap: 1.5,
                                mt: isExpanded ? 1.5 : 0,
                                pt: isExpanded ? 1.5 : 0,
                                borderTop: isExpanded ? '1px solid rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            {/* Quick Filter Buttons */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.4, alignItems: 'center' }}>
                                {(appliedFilters.length > 0 && isDesignMode) && (
                                    <Tooltip title="Clear all filters">
                                        <IconButton
                                            size="small"
                                            onClick={() => onApply([])}
                                            sx={{
                                                borderRadius: 2,
                                                bgcolor: 'rgba(0, 0, 0, 0.04)',
                                                color: 'text.primary',
                                                border: '1px solid rgba(0, 0, 0, 0.10)',
                                                mr: 0.5,
                                                '&:hover': {
                                                    bgcolor: 'rgba(0, 0, 0, 0.06)',
                                                    borderColor: 'rgba(0, 0, 0, 0.12)'
                                                }
                                            }}
                                        >
                                            <X size={16} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {!hasLoadedFilters && (
                                    <>
                                        <Skeleton variant="rounded" width={120} height={32} />
                                        <Skeleton variant="rounded" width={110} height={32} />
                                    </>
                                )}
                                {(isDesignMode && getItemsForCategory('Category').length > 0) && (
                                    <Chip
                                        icon={hasSelection('Category') ? <Check size={14} /> : <Layers size={15} />}
                                        label={getActiveFilterName('Category')}
                                        clickable
                                        onClick={(e) => openDropdown('Category', e)}
                                        variant={hasSelection('Category') ? "filled" : "outlined"}
                                        color={hasSelection('Category') ? "primary" : "default"}
                                        sx={{
                                            borderRadius: '8px',
                                            border: hasSelection('Category') ? 'none' : '1px solid #e0e0e0',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                )}
                                {(isDesignMode && getItemsForCategory('Gender').length > 0) && (
                                    <Chip
                                        icon={hasSelection('Gender') ? <Check size={14} /> : <Users size={15} />}
                                        label={getActiveFilterName('Gender')}
                                        clickable
                                        onClick={(e) => openDropdown('Gender', e)}
                                        variant={hasSelection('Gender') ? "filled" : "outlined"}
                                        color={hasSelection('Gender') ? "primary" : "default"}
                                        sx={{
                                            borderRadius: '8px',
                                            border: hasSelection('Gender') ? 'none' : '1px solid #e0e0e0',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                )}
                                {(showMoreFiltersButton && isDesignMode) && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Filter size={14} />}
                                        size="small"
                                        className={`more-filter-btn`}
                                        onClick={onFilterClick}
                                        sx={{
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {isFilterOpen ? "Close Filters" : "More Filters"}
                                    </Button>
                                )}

                                <Box sx={{ flexGrow: 1 }} />

                                {(!showMoreFiltersButton && isDesignMode) && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleSend(true)}
                                        className="quick-filter-btn"
                                        disabled={isCatalogLoading}
                                        sx={{
                                            '.MuiButton-startIcon': {
                                                marginRight: isCatalogLoading ? 1 : 0,
                                                transition: 'margin-right 200ms ease',
                                            },
                                        }}
                                        startIcon={
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: isCatalogLoading ? 16 : 0,
                                                    opacity: isCatalogLoading ? 1 : 0,
                                                    overflow: 'hidden',
                                                    transition: 'width 200ms ease, opacity 200ms ease',
                                                }}
                                            >
                                                <CircularProgress size={16} color="inherit" />
                                            </Box>
                                        }
                                    >
                                        View Catalog
                                    </Button>
                                )}
                            </Box>

                            {/* Dropdown Popover */}
                            <FilterDropdown
                                title={activeDropdown || ""}
                                items={getItemsForCategory(activeDropdown || "")}
                                anchorEl={anchorEl}
                                onClose={closeDropdown}
                                onSelect={handleFilterSelect}
                                selectedItems={appliedFilters}
                                isLoading={isLoadingFilters}
                                direction={suggestionPosition === 'top' ? 'top' : 'bottom'}
                            />

                            {/* Search Suggestions */}
                            {showSuggestions && (
                                <SearchSuggestions
                                    suggestions={suggestions}
                                    onSuggestionClick={handleSuggestionClick}
                                    isVisible={showSuggestionsDropdown && isExpanded}
                                    searchTerm={text}
                                    suggestionPosition={suggestionPosition}
                                    onHighlightChange={setHighlightedSuggestionIndex}
                                />
                            )}
                        </Box>
                    </Paper>
                </Box>

            </ClickAwayListener>
            <ImageEditorModal
                open={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                imageFile={imageFile}
                onSave={handleSaveEditedImage}
            />
        </>
    );
}

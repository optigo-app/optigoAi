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
} from "@mui/material";
import {
    Image as ImageIcon,
    X,
    ArrowRight,
    ImagePlus,
    Settings2,
    Layers,
    Users,
    Check
} from "lucide-react";
import "../Style/chatInput.scss";
import useCustomToast from "@/hook/useCustomToast";
import { filterMasterApi } from "@/app/api/filterMasterApi";
import { formatMasterData, getAuthData } from "@/utils/globalFunc";
import FilterDropdown from "./Product/FilterDropdown";
import SearchSuggestions from "./SearchSuggestions";

export default function ModernSearchBar({ onSubmit, onFilterClick, appliedFilters = [], onApply, initialExpanded = false, alwaysExpanded = false, showMoreFiltersButton = true, showSuggestions = false, productData = [], onSuggestionClick, autoFocus = false, suggestionPosition = 'bottom' }) {
    const { showSuccess, showError } = useCustomToast();
    const fileRef = useRef(null);
    const textFieldRef = useRef(null);
    const containerRef = useRef(null);

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
    const [isDragging, setIsDragging] = useState(false);
    const [isExpanded, setIsExpanded] = useState(initialExpanded || alwaysExpanded);
    const [isMultiline, setIsMultiline] = useState(false);

    // Filter Logic States
    const [filterData, setFilterData] = useState([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    // Suggestion States
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
    const [debouncedText, setDebouncedText] = useState("");
    const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);

    // Initialize Settings
    const [numResults, setNumResults] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('searchNumResults');
            return saved ? Number(saved) || 50 : 50;
        }
        return 50;
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
        if (!showSuggestions || !debouncedText.trim() || debouncedText.trim().length < 2) {
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
            { key: 'occassionname', type: 'occasion', filterCategory: 'Occasion' },
            { key: 'producttype', type: 'producttype', filterCategory: 'Product Type' }
        ];

        productData.forEach(product => {
            SEARCH_FIELDS.forEach(field => {
                const val = product[field.key];
                if (val && typeof val === 'string' && val.toLowerCase().includes(searchTerm)) {
                    const key = `${field.type}-${val}`;
                    if (!suggestionMap.has(key)) {
                        suggestionMap.set(key, {
                            type: field.type,
                            label: val,
                            value: val,
                            filterCategory: field.filterCategory,
                            count: 1
                        });
                    } else {
                        suggestionMap.get(key).count++;
                    }
                }
            });
        });

        if (debouncedText.length >= 2) {
            const lowerTerm = debouncedText.toLowerCase();
            const designMatches = productData
                .filter(p => p.designno && p.designno.toLowerCase().includes(lowerTerm))
                .slice(0, 10)
                .map(p => ({
                    type: 'design',
                    label: p.designno,
                    value: p.designno,
                    name: p.designno,
                    filterCategory: 'Design#',
                    category: p.categoryname,
                    id: p.id,
                    count: 1
                }));

            designMatches.forEach(match => {
                const key = `design-${match.label}`;
                if (!suggestionMap.has(key)) {
                    suggestionMap.set(key, match);
                }
            });
        }


        const suggestionArray = Array.from(suggestionMap.values());

        // Group by type and limit each to top 5
        const groupedByType = suggestionArray.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        const finalSuggestions = Object.values(groupedByType).flatMap(group =>
            group.sort((a, b) => b.count - a.count).slice(0, 5)
        );

        setSuggestions(finalSuggestions);
        setShowSuggestionsDropdown(suggestionArray.length > 0);
    }, [debouncedText, productData, showSuggestions]);

    useEffect(() => {
        let timeoutId;
        let isMounted = true;

        const fetchFilters = async () => {
            if (!isMounted) return;

            const cachedFilters = sessionStorage.getItem('filterMasterData');
            if (cachedFilters) {
                try {
                    setFilterData(JSON.parse(cachedFilters));
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
                if (Array.isArray(formatted) && formatted.length > 0) {
                    sessionStorage.setItem('filterMasterData', JSON.stringify(formatted));
                }
            } catch (err) {
                console.error("Failed to load search filters", err);
            } finally {
                if (isMounted) {
                    setIsLoadingFilters(false);
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
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setIsExpanded(true);
    };

    const handlePaste = (e) => {
        for (const item of e.clipboardData.items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                setIsExpanded(true);
            }
        }
    };

    const processDroppedFiles = (files) => {
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
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        processDroppedFiles(e.dataTransfer?.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    useEffect(() => {
        const handleWindowDragOver = (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "copy";
            }
            setIsDragging(true);
            setIsExpanded(true);
        };

        const handleWindowDragLeave = (e) => {
            e.preventDefault();
            if (e.target === document.documentElement || e.target === document.body) {
                setIsDragging(false);
            }
        };

        const handleWindowDrop = (e) => {
            e.preventDefault();
            processDroppedFiles(e.dataTransfer?.files);
        };

        window.addEventListener("dragover", handleWindowDragOver);
        window.addEventListener("dragleave", handleWindowDragLeave);
        window.addEventListener("drop", handleWindowDrop);

        return () => {
            window.removeEventListener("dragover", handleWindowDragOver);
            window.removeEventListener("dragleave", handleWindowDragLeave);
            window.removeEventListener("drop", handleWindowDrop);
        };
    }, []);

    const handleSend = () => {
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
            text: trimmedText,
            image: imageFile,
            isSearchFlag,
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
        <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ position: 'relative', width: '100%' }}>
                {isDragging && (
                    <Box
                        sx={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 1300,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                            background:
                                "radial-gradient(circle at center, rgba(115,103,240,0.12) 0, rgba(15,23,42,0.7) 60%)",
                            transition: "opacity 0.2s ease",
                        }}
                    >
                        <Box
                            sx={{
                                border: "2px dashed rgba(255,255,255,0.7)",
                                borderRadius: 3,
                                px: 4,
                                py: 3,
                                color: "#fff",
                                textAlign: "center",
                                backdropFilter: "blur(6px)",
                                bgcolor: "rgba(15,23,42,0.35)",
                            }}
                        >
                            <Box sx={{ mb: 1 }}>
                                <ImageIcon size={35} />
                            </Box>
                            <Box component="p" sx={{ m: 0, fontWeight: 600 }}>
                                Drop your jewelry image anywhere
                            </Box>
                        </Box>
                    </Box>
                )}

                <Paper
                    ref={containerRef}
                    elevation={isExpanded ? 12 : 2}
                    className={`chat-input-container ${isExpanded ? 'expanded' : 'minimized'}`}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
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
                                    <Box className="image-preview">
                                        <img src={imagePreview} alt="preview" />
                                        <Tooltip title="Remove image">
                                            <IconButton
                                                size="small"
                                                className="remove-image"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImagePreview(null);
                                                    setImageFile(null);
                                                }}
                                            >
                                                <X size={14} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Zoom>
                        )}

                        <Box className="input-flex-row">
                            {/* Upload Icon */}
                            {!isMultiline && (
                                <Tooltip title="Upload image">
                                    <IconButton
                                        className="iconbuttonsearch"
                                        onClick={() => fileRef.current.click()}
                                        sx={actionIconButtonSx}
                                    >
                                        <ImagePlus size={22} />
                                    </IconButton>
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
                                placeholder="Describe your idea, and I'll bring it to life"
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
                                <Tooltip title="Settings">
                                    <IconButton className="iconbuttonsearch" onClick={() => setIsExpanded(true)} sx={{ ...actionIconButtonSx, ml: 1 }}>
                                        <Settings2 size={20} />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {/* Actions Group - Inline */}
                            {(isExpanded && !isMultiline) && (
                                <Zoom in={isExpanded || text.length > 0 || Boolean(imagePreview)}>
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                        <Tooltip title={isExpanded ? "Minimize" : "Expand"}>
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

                                        <Tooltip title="AI Search" placement="top">
                                            <IconButton className="iconbuttonsearch" onClick={handleSend} sx={sendIconButtonSx}>
                                                <ArrowRight size={20} />
                                            </IconButton>
                                        </Tooltip>
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
                                            onClick={handleSend}
                                            sx={sendIconButtonSx}
                                        >
                                            <ArrowRight size={20} />
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
                            display: isExpanded ? 'flex' : 'none',
                            opacity: isExpanded ? 1 : 0,
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
                            {appliedFilters.length > 0 && (
                                <Tooltip title="Clear all filters">
                                    <IconButton
                                        size="small"
                                        onClick={() => onApply([])}
                                        sx={{
                                            borderRadius: 2,
                                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                                            color: 'text.white',
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
                            {getItemsForCategory('Category').length > 0 && (
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
                            {/* <Chip
                                icon={hasSelection('Style') ? <Check size={14} /> : <Palette size={15} />}
                                label={getActiveFilterName('Style')}
                                clickable
                                onClick={(e) => openDropdown('Style', e)}
                                variant={hasSelection('Style') ? "filled" : "outlined"}
                                color={hasSelection('Style') ? "primary" : "default"}
                                sx={{
                                    borderRadius: '8px',
                                    border: hasSelection('Style') ? 'none' : '1px solid #e0e0e0',
                                    transition: 'all 0.2s'
                                }}
                            /> */}
                            {getItemsForCategory('Gender').length > 0 && (
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
                            {showMoreFiltersButton && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    className="more-filter-btn"
                                    onClick={onFilterClick}
                                >
                                    More Filters
                                </Button>
                            )}

                            <Box sx={{ flexGrow: 1 }} />

                            {!showMoreFiltersButton && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleSend}
                                    className="quick-filter-btn"
                                >
                                    View Catalogue
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
    );
}

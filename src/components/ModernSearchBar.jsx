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
    Fade,
    Zoom,
    Chip,
} from "@mui/material";
import {
    Image as ImageIcon,
    X,
    ArrowUp,
    ImagePlus,
    Settings2,
    Layers,
    Palette,
    Users,
    Check
} from "lucide-react";
import "../Style/chatInput.scss";
import useCustomToast from "@/hook/useCustomToast";
import CustomSlider from "./CustomSlider";
import { filterMasterApi } from "@/app/api/filterMasterApi";
import { formatMasterData, getAuthData } from "@/utils/globalFunc";
import FilterDropdown from "./Product/FilterDropdown";

export default function ModernSearchBar({ onSubmit, onFilterClick, appliedFilters = [], onApply, initialExpanded = false, alwaysExpanded = false, showMoreFiltersButton = true }) {
    const { showSuccess, showError } = useCustomToast();
    const fileRef = useRef(null);
    const textFieldRef = useRef(null);
    const containerRef = useRef(null);

    // Original State
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [text, setText] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isExpanded, setIsExpanded] = useState(initialExpanded || alwaysExpanded);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMultiline, setIsMultiline] = useState(false);

    // Filter Logic States
    const [filterData, setFilterData] = useState([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

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

    // Load Filter Data on Mount (Single Fetch, but wait for auth)
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
        if (categoryName === 'Collection') target = 'DesignCollection';
        if (categoryName === 'Style') target = 'Category';
        if (categoryName === 'Gender') target = 'Gender';

        const found = filterData.find(c =>
            c.name.toLowerCase().includes(target.toLowerCase()) ||
            c.name.toLowerCase().includes(categoryName.toLowerCase())
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

        if (!trimmedText && !imageFile) {
            showError("Please enter text or upload an image", "warning");
            return;
        }

        let isSearchFlag = 0;
        if (trimmedText && imageFile) {
            isSearchFlag = 3; // Hybrid
        } else if (imageFile) {
            isSearchFlag = 2; // Image
        } else if (trimmedText) {
            isSearchFlag = 1; // Text
        }

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

        if (e.key === "Enter") {
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
        if (!isSettingsOpen && !activeDropdown) {
            setIsExpanded(false);
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
                                        onClick={() => fileRef.current.click()}
                                        className="upload-btn"
                                        sx={{ p: 1 }}
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

                            {/* Actions Group - Inline */}
                            {!isMultiline && (
                                <Zoom in={isExpanded || text.length > 0 || Boolean(imagePreview)}>
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                        <Tooltip title="Advanced Settings">
                                            <IconButton
                                                className="settings-btn"
                                                size="small"
                                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                                sx={{
                                                    color: isSettingsOpen ? 'primary.main' : 'text.secondary',
                                                    mr: 0.5
                                                }}
                                            >
                                                <Settings2 size={20} />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Search">
                                            <IconButton className="send-btn" onClick={handleSend}>
                                                <ArrowUp size={20} />
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
                                        onClick={() => fileRef.current.click()}
                                        className="upload-btn"
                                        sx={{ p: 1 }}
                                    >
                                        <ImagePlus size={22} />
                                    </IconButton>
                                </Tooltip>

                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Tooltip title="Advanced Settings">
                                        <IconButton
                                            className="settings-btn"
                                            size="small"
                                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                            sx={{
                                                color: isSettingsOpen ? 'primary.main' : 'text.secondary',
                                            }}
                                        >
                                            <Settings2 size={20} />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Search">
                                        <IconButton className="send-btn" onClick={handleSend}>
                                            <ArrowUp size={20} />
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
                        {!isSettingsOpen && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.4, alignItems: 'center' }}>
                                {appliedFilters.length > 0 && (
                                    <Tooltip title="Clear all filters">
                                        <IconButton
                                            size="small"
                                            onClick={() => onApply([])}
                                            sx={{
                                                bgcolor: '#ffebee',
                                                color: '#d32f2f',
                                                mr: 0.5,
                                                '&:hover': { bgcolor: '#ffcdd2' }
                                            }}
                                        >
                                            <X size={16} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Chip
                                    icon={hasSelection('Collection') ? <Check size={14} /> : <Layers size={15} />}
                                    label={getActiveFilterName('Collection')}
                                    clickable
                                    onClick={(e) => openDropdown('Collection', e)}
                                    variant={hasSelection('Collection') ? "filled" : "outlined"}
                                    color={hasSelection('Collection') ? "primary" : "default"}
                                    sx={{
                                        borderRadius: '8px',
                                        border: hasSelection('Collection') ? 'none' : '1px solid #e0e0e0',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                <Chip
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
                                />
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

                                <Box sx={{ flexGrow: 1 }} />

                                {showMoreFiltersButton && (
                                    <Button
                                        variant="text"
                                        size="small"
                                        className="quick-filter-btn"
                                        onClick={onFilterClick}
                                        sx={{ color: 'primary.main', textTransform: 'none', fontWeight: 600 }}
                                    >
                                        More Filters
                                    </Button>
                                )}
                            </Box>
                        )}

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

                        {/* Settings Slider Section (if toggled) */}
                        {isSettingsOpen && (
                            <Fade in={isSettingsOpen}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 3,
                                    alignItems: 'center',
                                    p: "0px 16px",
                                }}>
                                    <Box sx={{ flex: 1 }}>
                                        <CustomSlider
                                            label="Number of Results"
                                            value={numResults}
                                            onChange={setNumResults}
                                            min={1}
                                            max={50}
                                            step={1}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <CustomSlider
                                            label="Search Accuracy"
                                            value={accuracy}
                                            onChange={setAccuracy}
                                            min={0}
                                            max={100}
                                            step={5}
                                            unit="%"
                                        />
                                    </Box>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </Paper>
            </Box>
        </ClickAwayListener>
    );
}

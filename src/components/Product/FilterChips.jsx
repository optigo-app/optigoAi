"use client";

import React from 'react';
import { Chip, Avatar, Box, IconButton, Tooltip, Popover, TextField, Button, Stack, Typography, CircularProgress } from '@mui/material';
import { Image as ImageIcon, ThumbsDown, ThumbsUp, MessageSquare, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageHoverPreview from '@/components/Common/ImageHoverPreview';
import { saveAiSearchFeedbackApi } from '@/app/api/saveAiSearchFeedbackApi';
import { uploadService } from '@/services/uploadService';
import { compressImagesToWebP } from '@/utils/globalFunc';
import useCustomToast from '@/hook/useCustomToast';

const softPrimaryChipSx = {
    borderRadius: 2,
    bgcolor: 'rgba(0, 0, 0, 0.04)',
    color: 'text.primary',
    border: '1px solid rgba(0, 0, 0, 0.10)',
    '&:hover': {
        bgcolor: 'rgba(0, 0, 0, 0.06)',
    },
};

const softErrorChipSx = {
    borderRadius: 2,
    bgcolor: 'rgba(0, 0, 0, 0.04)',
    color: 'text.primary',
    border: '1px solid rgba(0, 0, 0, 0.10)',
    '&:hover': {
        bgcolor: 'rgba(0, 0, 0, 0.06)',
    },
};

const softNeutralChipSx = {
    borderRadius: 2,
    bgcolor: 'rgba(0, 0, 0, 0.04)',
    color: 'text.primary',
    border: '1px solid rgba(0, 0, 0, 0.10)',
    '&:hover': {
        bgcolor: 'rgba(0, 0, 0, 0.06)',
    },
};

export default function FilterChips({
    appliedFilters,
    onRemoveFilter,
    onImageChipClick,
    onFilterPopoverOpen,
    searchData // Added searchData prop if needed or we can use item content
}) {
    const { showSuccess, showError, showWarning } = useCustomToast();
    const [isReporting, setIsReporting] = React.useState(false);
    const [dislikedIds, setDislikedIds] = React.useState([]);
    const [likedIds, setLikedIds] = React.useState([]);
    const [sentIds, setSentIds] = React.useState([]); // Track what actually made it to DB
    const [feedbackIds, setFeedbackIds] = React.useState({}); // { itemId: feedbackID from DB }
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [reasonMenuAnchor, setReasonMenuAnchor] = React.useState(null);
    const [activeReasonItem, setActiveReasonItem] = React.useState(null);
    const [commentingItem, setCommentingItem] = React.useState(null);
    const [commentText, setCommentText] = React.useState('');
    const [showOtherInput, setShowOtherInput] = React.useState(false);

    const DISLIKE_REASONS = [
        "Not relevant to search",
        "Inaccurate results",
        "Poor visual quality",
        "Too generic",
        "Other"
    ];

    // Reset feedback stats when the search content changes
    const searchFilters = appliedFilters.filter(
        (f) => f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id)
    );

    React.useEffect(() => {
        setDislikedIds([]);
        setLikedIds([]);
        setSentIds([]);
        setFeedbackIds({});
    }, [JSON.stringify(searchFilters.map(f => ({ id: f.item.id, name: f.item.name, url: f.item.imageUrl })))]);

    const handleFeedback = async (item, isLiked, comment = "") => {
        const currentlyLiked = likedIds.includes(item.id);
        const currentlyDisliked = dislikedIds.includes(item.id);

        // Toggle logic: If clicking the same button again, it's a removal
        let actualStatus = isLiked;
        let isRemoval = false;
        if (!comment) {
            if ((isLiked === "1" && currentlyLiked) || (isLiked === "0" && currentlyDisliked)) {
                isRemoval = true;
            }
        }

        // Optimistic UI Update (Immediate response)
        // Ensure mutual exclusivity even if there's a comment (e.g. dislike reasons)
        if (isRemoval) {
            setLikedIds(prev => prev.filter(id => id !== item.id));
            setDislikedIds(prev => prev.filter(id => id !== item.id));
        } else if (isLiked === "1") {
            setLikedIds(prev => [...prev.filter(id => id !== item.id), item.id]);
            setDislikedIds(prev => prev.filter(id => id !== item.id));
        } else if (isLiked === "0") {
            setDislikedIds(prev => [...prev.filter(id => id !== item.id), item.id]);
            setLikedIds(prev => prev.filter(id => id !== item.id));
        }

        setIsReporting(true);

        // Don't duplicate if already sent exactly this
        const feedbackKey = `${item.id}-${actualStatus}-${comment}${isRemoval ? '-remove' : ''}`;
        if (sentIds.includes(feedbackKey)) {
            setIsReporting(false);
            return;
        }

        try {
            let imageUrl = "";
            let imageFileName = "";
            let eventName = "TextSearch";

            if (item.id === "image-search") eventName = "ImageSearch";
            if (item.id === "hybrid-search") eventName = "HybridSearch";

            // 1. If image search and NOT a removal, upload image
            if (!isRemoval && (item.id === "image-search" || item.id === "hybrid-search") && item.imageUrl) {
                const storedUKey = typeof window !== 'undefined' ? sessionStorage.getItem('ukey') : null;
                // Use proxy to avoid CORS errors
                const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(item.imageUrl)}`;
                const response = await fetch(proxyUrl);
                const blob = await response.blob();
                const file = new File([blob], "search-image.webp", { type: "image/webp" });

                const compressed = await compressImagesToWebP(file);
                if (compressed && compressed.length > 0) {
                    const uploadResult = await uploadService.uploadFile(
                        compressed[0].blob,
                        'AiSearch',
                        storedUKey || undefined
                    );

                    if (uploadResult && uploadResult.url) {
                        imageUrl = uploadResult.fileName;
                        imageFileName = uploadResult.name || uploadResult.fileName || "";
                    } else {
                        showError("Failed to upload image. Feedback not sent.");
                        setIsReporting(false);
                        return;
                    }
                }
            }

            // 2. Call the feedback API
            let searchText = item.name || "";
            if (item.id === "image-search") {
                searchText = "";
            } else if (item.id === "hybrid-search") {
                searchText = item.text || (item.name === "Hybrid Search" ? "" : item.name);
            }

            const response = await saveAiSearchFeedbackApi({
                EventName: eventName,
                SearchText: searchText,
                ImageUrl: imageUrl,
                FileName: imageFileName,
                IsLiked: isRemoval ? (currentlyLiked ? "1" : "0") : actualStatus,
                FeedbackID: feedbackIds[item.id] || "",
                Comment: comment,
                RemoveFeedback: isRemoval
            });

            // Persistence: Store FeedbackID for future updates/removal
            if (response && response?.rd?.[0]?.FeedbackID) {
                const newFid = response.rd[0].FeedbackID;
                setFeedbackIds(prev => ({ ...prev, [item.id]: newFid }));
            }

            // Cleanup ID on successful removal
            if (isRemoval) {
                setFeedbackIds(prev => {
                    const next = { ...prev };
                    delete next[item.id];
                    return next;
                });
            }

            if (isRemoval) {
                // Clear all sent status for this item on removal so it can be re-sent later if changed
                setSentIds(prev => prev.filter(key => !key.startsWith(`${item.id}-`)));
            } else {
                setSentIds(prev => [...prev.filter(key => !key.startsWith(`${item.id}-`)), feedbackKey]);
            }

            if (comment) {
                showSuccess("Thank you for your feedback!");
                handleCloseComment();
            }
        } catch (error) {
            console.error("Error reporting feedback:", error);
            showError("Failed to report feedback.");
        } finally {
            setIsReporting(false);
        }
    };

    const handleOpenComment = (event, item) => {
        setAnchorEl(event.currentTarget);
        setCommentingItem(item);
        setCommentText('');
    };

    const handleCloseComment = () => {
        setAnchorEl(null);
        setCommentingItem(null);
        setCommentText('');
        setShowOtherInput(false);
    };

    const handleOpenReasonMenu = (event, item) => {
        setReasonMenuAnchor(event.currentTarget);
        setActiveReasonItem(item);
        setShowOtherInput(false);
        setCommentText('');
    };

    const handleCloseReasonMenu = () => {
        setReasonMenuAnchor(null);
        setActiveReasonItem(null);
        setShowOtherInput(false);
        setCommentText('');
    };

    const handleSelectReason = (reason) => {
        if (reason === "Other") {
            setShowOtherInput(true);
        } else {
            // Submit reason as comment
            handleFeedback(activeReasonItem, "0", reason);
            handleCloseReasonMenu();
        }
    };

    const submitComment = () => {
        if (!commentText.trim()) return;
        handleFeedback(activeReasonItem, "0", commentText);
        handleCloseReasonMenu();
    };
    // Separate search filters from drawer filters

    const drawerFilters = appliedFilters.filter(
        (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
    );

    // Group drawer filters by category
    const groupedFilters = drawerFilters.reduce((acc, curr) => {
        if (!acc[curr.category]) {
            acc[curr.category] = [];
        }
        acc[curr.category].push(curr);
        return acc;
    }, {});

    return (
        <>
            {/* Render Search Chips (Always Visible) */}
            {searchFilters.map(({ category, item }) => {
                const isImageSearch = item.id === "image-search" || item.id === "hybrid-search";
                const isError = item.error === true;

                const chipComponent = (
                    <Chip
                        avatar={
                            isImageSearch && item.imageUrl ? (
                                <Avatar
                                    src={item.imageUrl}
                                    alt="search"
                                    variant="rounded"
                                    sx={{
                                        borderRadius: 2
                                    }}
                                />
                            ) : item.icon ? (
                                <ImageIcon size={14} />
                            ) : undefined
                        }
                        label={item.name}
                        size="small"
                        onDelete={() => onRemoveFilter({ item })}
                        sx={{
                            bgcolor: isError ? 'error.main' : 'primary.main',
                            color: isError ? 'error.contrastText' : 'primary.contrastText',
                            maxWidth: '200px',
                            cursor: isImageSearch && !isError ? 'pointer' : 'default',
                            opacity: isError ? 0.9 : 1,
                            borderRadius: 2,
                            flexShrink: 0,
                            '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            },
                            '& .MuiChip-avatar': {
                                borderColor: 'white',
                                borderWidth: 1,
                                borderStyle: 'solid',
                                opacity: isError ? 0.7 : 1
                            },
                            '& .MuiChip-deleteIcon': {
                                color: isError ? 'error.contrastText' : 'primary.contrastText',
                                opacity: 0.8,
                                '&:hover': {
                                    opacity: 1
                                }
                            }
                        }}
                    />
                );

                return (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isImageSearch && item.imageUrl && !isError ? (
                            <ImageHoverPreview
                                imageSrc={item.imageUrl}
                                altText="Search Image"
                                triggerMode="hover"
                                maxWidth={300}
                            >
                                {chipComponent}
                            </ImageHoverPreview>
                        ) : (
                            chipComponent
                        )}

                        <React.Fragment>
                            {/* Feedback selection logic - Individual Buttons */}
                            {['1', '0'].map((type) => {
                                const isLiked = type === '1';
                                const active = isLiked ? likedIds.includes(item.id) : dislikedIds.includes(item.id);
                                const color = isLiked ? 'success' : 'error';
                                const Icon = isLiked ? ThumbsUp : ThumbsDown;
                                const tooltip = isLiked ? (active ? "Liked" : "Like results") : (active ? "Disliked" : "Dislike results");

                                return (
                                    <Tooltip key={type} title={tooltip}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isLiked) {
                                                    handleFeedback(item, type);
                                                } else {
                                                    // For Dislike: if already active, toggle off. Otherwise open menu.
                                                    if (active) handleFeedback(item, type);
                                                    else handleOpenReasonMenu(e, item);
                                                }
                                            }}
                                            sx={{
                                                p: '4.5px',
                                                width: 28,
                                                height: 28,
                                                bgcolor: active ? `${color}.main` : 'rgba(255, 255, 255, 0.45)',
                                                backdropFilter: 'blur(8px)',
                                                color: active ? `${color}.contrastText` : 'text.secondary',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    bgcolor: active ? `${color}.dark` : 'rgba(255, 255, 255, 0.65)',
                                                    transform: 'scale(1.15)',
                                                },
                                                '&:active': { transform: 'scale(0.9)' },
                                            }}
                                        >
                                            <Icon size={active ? 13 : 14} style={{ strokeWidth: 2.5 }} />
                                        </IconButton>
                                    </Tooltip>
                                );
                            })}
                        </React.Fragment>
                    </Box>
                );
            })}

            {/* Render Grouped Drawer Chips */}
            {Object.entries(groupedFilters).map(([category, items]) => {
                let visibleItems, hiddenItems;

                if (items.length <= 2) {
                    visibleItems = items;
                    hiddenItems = [];
                } else {
                    visibleItems = items.slice(0, 1);
                    hiddenItems = items.slice(1);
                }

                return (
                    <React.Fragment key={category}>
                        {visibleItems.map(({ item }) => (
                            <Chip
                                key={item.id}
                                label={`${category}: ${item.name}`}
                                size="small"
                                onDelete={() => onRemoveFilter({ item })}
                                sx={{
                                    ...softPrimaryChipSx,
                                    flexShrink: 0,
                                    maxWidth: '240px',
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    },
                                    '& .MuiChip-deleteIcon': {
                                        color: 'text.secondary',
                                        opacity: 0.8,
                                        '&:hover': { opacity: 1 }
                                    }
                                }}
                            />
                        ))}
                        {hiddenItems.length > 0 && (
                            <Chip
                                label={`+${hiddenItems.length}`}
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFilterPopoverOpen(e, hiddenItems);
                                }}
                                sx={{
                                    ...softNeutralChipSx,
                                    flexShrink: 0,
                                    cursor: 'pointer'
                                }}
                            />
                        )}
                    </React.Fragment>
                );
            })}

            {/* Dislike Reason Menu */}
            <Popover
                open={Boolean(reasonMenuAnchor)}
                anchorEl={reasonMenuAnchor}
                onClose={handleCloseReasonMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        width: 240,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        p: 1.5,
                        transition: 'all 0.3s ease'
                    }
                }}
            >
                <Typography variant="overline" sx={{ px: 1, py: 0.5, opacity: 0.6, display: 'block', fontWeight: 700, color: 'error.main' }}>
                    Why this result?
                </Typography>
                <Stack spacing={0.5}>
                    {!showOtherInput ? (
                        DISLIKE_REASONS.map((reason) => (
                            <Button
                                key={reason}
                                onClick={() => handleSelectReason(reason)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    color: 'text.primary',
                                    fontSize: '0.8rem',
                                    py: 1,
                                    px: 1.5,
                                    borderRadius: 1.5,
                                    fontWeight: 500,
                                    '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.04)',
                                        color: 'error.main'
                                    }
                                }}
                            >
                                {reason}
                            </Button>
                        ))
                    ) : (
                        <Box sx={{ p: 0.5 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Tell us more..."
                                size="small"
                                autoFocus
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value.slice(0, 300))}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.8rem',
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                        '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                                    }
                                }}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                <Button
                                    fullWidth
                                    size="small"
                                    onClick={() => setShowOtherInput(false)}
                                    sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                                >
                                    Back
                                </Button>
                                <Button
                                    fullWidth
                                    size="small"
                                    variant="contained"
                                    disabled={!commentText.trim() || isReporting}
                                    onClick={submitComment}
                                >
                                    {isReporting ? <CircularProgress size={12} color="inherit" /> : 'Submit'}
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Popover>
        </>
    );
}

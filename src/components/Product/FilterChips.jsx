"use client";

import React from 'react';
import { Chip, Avatar, Box } from '@mui/material';
import { Image as ImageIcon, ThumbsDown } from 'lucide-react';
import ImageHoverPreview from '@/components/Common/ImageHoverPreview';
import { IconButton, Tooltip } from '@mui/material';
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

    // Reset disliked stats when the search content changes
    const searchFilters = appliedFilters.filter(
        (f) => f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id)
    );

    React.useEffect(() => {
        setDislikedIds([]);
    }, [JSON.stringify(searchFilters.map(f => ({ id: f.item.id, name: f.item.name, url: f.item.imageUrl })))]);

    const handleDislike = async (category, item) => {
        if (isReporting || dislikedIds.includes(item.id)) return;
        setIsReporting(true);

        try {
            let imageUrl = "";
            let eventName = "TextSearch";

            if (item.id === "image-search") eventName = "ImageSearch";
            if (item.id === "hybrid-search") eventName = "HybridSearch";

            // 1. If image search, compress and upload first
            if ((item.id === "image-search" || item.id === "hybrid-search") && item.imageUrl) {
                // Fetch cached ukey if available
                const storedUKey = typeof window !== 'undefined' ? sessionStorage.getItem('ukey') : null;

                const response = await fetch(item.imageUrl);
                const blob = await response.blob();
                const file = new File([blob], "search-image.webp", { type: "image/webp" });

                const compressed = await compressImagesToWebP(file);
                if (compressed && compressed.length > 0) {
                    // Pass storedUKey if it exists, otherwise service uses default
                    const uploadResult = await uploadService.uploadFile(
                        compressed[0].blob,
                        'OptiogoAiSearch',
                        storedUKey || undefined
                    );

                    if (uploadResult && uploadResult.url) {
                        imageUrl = uploadResult.fileName;
                    } else {
                        showError("Failed to upload image. Feedback not sent.");
                        return; // Abort as per user requirement
                    }
                } else {
                    showError("Failed to process image. Feedback not sent.");
                    return; // Abort if compression failed
                }
            }

            // 2. Call the feedback API
            let searchText = item.name || "";
            if (item.id === "image-search") {
                searchText = "";
            } else if (item.id === "hybrid-search") {
                searchText = item.text || (item.name === "Hybrid Search" ? "" : item.name);
            }

            await saveAiSearchFeedbackApi({
                EventName: eventName,
                SearchText: searchText,
                ImageUrl: imageUrl,
                IsLiked: "0",
                Comment: ""
            });

            setDislikedIds(prev => [...prev, item.id]);
            showSuccess("Thank you for your feedback!");
        } catch (error) {
            console.error("Error reporting feedback:", error);
            showError("Failed to report feedback.");
        } finally {
            setIsReporting(false);
        }
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

                        {true && (
                            <Tooltip title={dislikedIds.includes(item.id) ? "Feedback recorded" : "Dislike results"}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDislike(category, item);
                                    }}
                                    disabled={isReporting || dislikedIds.includes(item.id)}
                                    sx={{
                                        p: '5px',
                                        width: 28,
                                        height: 28,
                                        bgcolor: dislikedIds.includes(item.id) ? 'error.main' : 'rgba(0, 0, 0, 0.05)',
                                        color: dislikedIds.includes(item.id) ? 'error.contrastText' : 'text.secondary',
                                        borderRadius: '50%',
                                        border: dislikedIds.includes(item.id) ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            bgcolor: dislikedIds.includes(item.id) ? 'error.dark' : 'rgba(0, 0, 0, 0.08)',
                                            transform: 'scale(1.05)',
                                        },
                                        '&:active': {
                                            transform: 'scale(0.9)',
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: dislikedIds.includes(item.id) ? 'error.main' : 'action.disabledBackground',
                                            color: dislikedIds.includes(item.id) ? 'error.contrastText' : 'action.disabled',
                                            opacity: dislikedIds.includes(item.id) ? 0.8 : 0.5,
                                            transform: 'none'
                                        },
                                        '& .lucide': {
                                            strokeWidth: 2.5
                                        }
                                    }}
                                >
                                    <ThumbsDown size={14} />
                                </IconButton>
                            </Tooltip>
                        )}
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
        </>
    );
}

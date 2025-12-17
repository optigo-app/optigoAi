"use client";

import React from 'react';
import { Chip, Avatar, Box } from '@mui/material';
import { Image as ImageIcon } from 'lucide-react';
import ImageHoverPreview from '@/components/Common/ImageHoverPreview';

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
    onFilterPopoverOpen
}) {
    // Separate search filters from drawer filters
    const searchFilters = appliedFilters.filter(
        (f) => f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id)
    );

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

                const chipContent = (
                    <Chip
                        key={item.id}
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

                if (isImageSearch && item.imageUrl && !isError) {
                    return (
                        <ImageHoverPreview
                            key={item.id}
                            imageSrc={item.imageUrl}
                            altText="Search Image"
                            triggerMode="click"
                            maxWidth={300}
                        >
                            {chipContent}
                        </ImageHoverPreview>
                    );
                }

                return chipContent;
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

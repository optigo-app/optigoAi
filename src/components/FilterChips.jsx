"use client";

import React from 'react';
import { Chip, Avatar } from '@mui/material';
import { Image as ImageIcon } from 'lucide-react';

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
                return (
                    <Chip
                        key={item.id}
                        avatar={
                            isImageSearch && item.imageUrl ? (
                                <Avatar
                                    src={item.imageUrl}
                                    alt="search"
                                    variant="rounded"
                                    sx={{
                                        borderRadius: '6px'
                                    }}
                                />
                            ) : item.icon ? (
                                <ImageIcon size={14} />
                            ) : undefined
                        }
                        label={item.name}
                        size="small"
                        onDelete={() => onRemoveFilter({ item })}
                        onClick={isImageSearch ? (e) => onImageChipClick(e, item) : undefined}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            maxWidth: '200px',
                            cursor: isImageSearch ? 'pointer' : 'default',
                            '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            },
                            '& .MuiChip-avatar': {
                                borderColor: 'white',
                                borderWidth: 1,
                                borderStyle: 'solid'
                            }
                        }}
                    />
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
                            />
                        ))}
                        {hiddenItems.length > 0 && (
                            <Chip
                                label={`+${hiddenItems.length} ${category}`}
                                size="small"
                                variant="outlined"
                                onClick={(e) => onFilterPopoverOpen(e, hiddenItems)}
                                sx={{
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
}

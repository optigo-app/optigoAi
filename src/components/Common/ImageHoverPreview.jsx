import React, { useState, useRef } from 'react';
import { Box, Popover } from '@mui/material';
import { Maximize2 } from 'lucide-react';
import ImageViewerModal from './ImageViewerModal';

export default function ImageHoverPreview({
    imageSrc,
    altText = "Preview",
    children,
    triggerMode = "hover", // 'hover' | 'click'
    maxHeight = 200,
    maxWidth = 200
}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const hoverTimeoutRef = useRef(null);

    const handleOpen = (event) => {
        const target = event.currentTarget;
        if (triggerMode === 'hover') {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
            }
        }
        setAnchorEl(target);
    };

    const handleClose = () => {
        if (triggerMode === 'hover') {
            hoverTimeoutRef.current = setTimeout(() => {
                setAnchorEl(null);
            }, 100);
        } else {
            setAnchorEl(null);
        }
    };

    const handlePopoverMouseEnter = () => {
        if (triggerMode === 'hover' && hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleImageClick = () => {
        setIsViewerOpen(true);
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    if (!imageSrc) return children;

    const triggerProps = triggerMode === 'hover' ? {
        onMouseEnter: handleOpen,
        onMouseLeave: handleClose,
        aria_owns: open ? 'mouse-over-popover' : undefined,
        aria_haspopup: "true"
    } : {
        onClick: handleOpen,
        aria_owns: open ? 'mouse-over-popover' : undefined,
        aria_haspopup: "true"
    };

    return (
        <>
            <Box
                component="span"
                sx={{ display: 'inline-flex' }}
                {...triggerProps}
            >
                {children}
            </Box>

            <Popover
                id="mouse-over-popover"
                sx={{ pointerEvents: 'none' }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handleClose}
                disableRestoreFocus
                slotProps={{
                    paper: {
                        onMouseEnter: handlePopoverMouseEnter,
                        onMouseLeave: handleClose,
                        elevation: 8,
                        sx: {
                            borderRadius: 2,
                            overflow: 'hidden',
                            mt: 1,
                            pointerEvents: 'auto'
                        }
                    }
                }}
            >
                <Box sx={{ p: 0.5, bgcolor: 'background.paper' }}>
                    <Box
                        sx={{
                            position: 'relative',
                            cursor: 'pointer',
                            '&:hover .overlay': { opacity: 1 }
                        }}
                        onClick={handleImageClick}
                    >
                        <Box
                            component="img"
                            src={imageSrc}
                            alt={altText}
                            sx={{
                                maxWidth: `${maxWidth}px`,
                                maxHeight: `${maxHeight}px`,
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block',
                                borderRadius: 1.5
                            }}
                        />
                        <Box
                            className="overlay"
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                borderRadius: 1.5
                            }}
                        >
                            <Maximize2 color="white" size={32} />
                        </Box>
                    </Box>
                </Box>
            </Popover>

            {isViewerOpen && (
                <ImageViewerModal
                    open={isViewerOpen}
                    onClose={() => setIsViewerOpen(false)}
                    imageUrl={imageSrc}
                />
            )}
        </>
    );
}

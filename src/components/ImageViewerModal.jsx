"use client";

import React, { useState } from 'react';
import {
    Dialog,
    Box,
    IconButton,
    Tooltip,
    Typography,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    RotateCcw,
    Minimize2,
    Info
} from 'lucide-react';
import { useShortcuts } from '@/hook/useShortcuts';


export default function ImageViewerModal({ open, onClose, imageUrl, altText = "Image Preview" }) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);

    const SCOPE = "image-viewer";

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
    const handleRotateCw = () => setRotation(prev => prev + 90);
    const handleRotateCcw = () => setRotation(prev => prev - 90);
    const handleReset = () => {
        setScale(1);
        setRotation(0);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    useShortcuts(
        SCOPE,
        {
            "+": handleZoomIn,      // Standard: + or = key
            "=": handleZoomIn,      // Alternative without shift
            "-": handleZoomOut,     // Standard: - key
            "_": handleZoomOut,     // Alternative with shift
            "r": handleRotateCcw,   // Standard: [ for counter-clockwise
            "R": handleRotateCw,    // Standard: ] for clockwise
            "0": handleReset,       // Standard: 0 to reset
            Escape: onClose,        // Standard: Esc to close
        },
        open
    );

    if (!imageUrl) return null;

    const shortcuts = [
        { key: '+', description: 'Zoom In' },
        { key: '-', description: 'Zoom Out' },
        { key: 'R', description: 'Rotate Right' },
        { key: 'r', description: 'Rotate Left' },
        { key: '0', description: 'Reset' },
        { key: 'Esc', description: 'Close' },
    ];

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDialog-paper': {
                    bgcolor: 'rgba(0, 0, 0, 0.95)',
                    backgroundImage: 'none',
                },
            }}
        >
            {/* Toolbar */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
                        {altText}
                    </Typography>
                    <Tooltip title="Keyboard Shortcuts">
                        <IconButton onClick={handleMenuOpen} sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                            <Info size={20} />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Zoom Out (-)">
                        <IconButton onClick={handleZoomOut} sx={{ color: 'white' }}>
                            <ZoomOut size={24} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Zoom In (Shift + =)">
                        <IconButton onClick={handleZoomIn} sx={{ color: 'white' }}>
                            <ZoomIn size={24} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Rotate Left ([)">
                        <IconButton onClick={handleRotateCcw} sx={{ color: 'white' }}>
                            <RotateCcw size={24} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Rotate Right (])">
                        <IconButton onClick={handleRotateCw} sx={{ color: 'white' }}>
                            <RotateCw size={24} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Reset (0)">
                        <IconButton onClick={handleReset} sx={{ color: 'white' }}>
                            <Minimize2 size={24} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Close (Esc)">
                        <IconButton onClick={onClose} sx={{ color: 'white', ml: 2 }}>
                            <X size={28} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Keyboard Shortcuts Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(30, 30, 30, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: 240,
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                        Keyboard Shortcuts
                    </Typography>
                </Box>
                {shortcuts.map((shortcut, index) => (
                    <MenuItem
                        key={index}
                        sx={{
                            py: 1.5,
                            px: 2,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                            cursor: 'default'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 4 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                {shortcut.description}
                            </Typography>
                            <Box
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    minWidth: 40,
                                    textAlign: 'center'
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'white',
                                        fontWeight: 600,
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {shortcut.key}
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

            {/* Image */}
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    p: 4,
                }}
            >
                <Box
                    component="img"
                    src={imageUrl}
                    alt={altText}
                    sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease',
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        cursor: scale > 1 ? 'grab' : 'default',
                    }}
                    draggable={false}
                />
            </Box>
        </Dialog>
    );
}

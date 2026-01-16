"use client";
import React from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus } from 'lucide-react';

const DragDropOverlay = ({
    isDraggingGlobal,
    isDraggingLocal,
    onDrop,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onClose,
    title,
    subtitle
}) => {
    return (
        <AnimatePresence>
            {isDraggingGlobal && (
                <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        onDragOver?.(e);
                        if (e.target === e.currentTarget) {
                            onDragLeave?.(e);
                        }
                    }}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose?.();
                    }}
                    sx={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isDraggingLocal ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.3)",
                        backdropFilter: isDraggingLocal ? "blur(8px)" : "blur(4px)",
                        transition: "all 0.15s ease",
                        pointerEvents: "auto", // Enable interaction
                    }}
                >
                    <Box
                        component={motion.div}
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDragEnter?.(e);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDrop?.(e);
                            onClose?.(); // Ensure overlay closes after drop
                        }}
                        sx={{
                            border: "2px dashed",
                            borderColor: isDraggingLocal ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                            borderRadius: "24px",
                            width: "100%",
                            maxWidth: "720px",
                            height: "auto",
                            maxHeight: "90vh",
                            aspectRatio: "1/0.6",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            textAlign: "center",
                            bgcolor: isDraggingLocal ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                            boxShadow: isDraggingLocal ? "0 0 40px rgba(115,103,240,0.3)" : "none",
                            p: 4,
                            transition: "all 0.15s ease-out",
                            pointerEvents: "auto",
                        }}
                    >
                        <motion.div
                            animate={{
                                y: isDraggingLocal ? [0, -8, 0] : [0, -4, 0],
                                scale: isDraggingLocal ? 1.1 : 1
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Box
                                sx={{
                                    width: 65,
                                    height: 65,
                                    borderRadius: "50%",
                                    background: isDraggingLocal ? "rgba(115,103,240,0.3)" : "rgba(255, 255, 255, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: 2,
                                    transition: "all 0.15s ease",
                                }}
                            >
                                <ImagePlus size={35} strokeWidth={1.5} color={isDraggingLocal ? "#fff" : "rgba(255,255,255,0.8)"} />
                            </Box>
                        </motion.div>

                        <Box
                            component="p"
                            sx={{
                                m: 0,
                                fontWeight: 600,
                                fontSize: isDraggingLocal ? "1.6rem" : "1.3rem",
                                opacity: isDraggingLocal ? 1 : 0.7,
                                transition: "all 0.15s ease",
                            }}
                        >
                            {title ? title : (isDraggingLocal ? "Release to search jewelry" : "Drag over search bar")}
                        </Box>

                        <Box
                            component="p"
                            sx={{
                                m: 0,
                                mt: 1,
                                fontSize: "0.95rem",
                                opacity: isDraggingLocal ? 0.8 : 0.5,
                                transition: "all 0.15s ease",
                            }}
                        >
                            {subtitle ? subtitle : (isDraggingLocal ? "Using AI Vision" : "Drop it right inside the box")}
                        </Box>
                    </Box>
                </Box>
            )}
        </AnimatePresence>
    );
};

export default DragDropOverlay;

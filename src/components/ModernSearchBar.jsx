"use client";

import { useEffect, useState, useRef } from "react";
import {
    Box,
    IconButton,
    Paper,
    TextField,
    Tooltip,
} from "@mui/material";
import { Image as ImageIcon, X, ArrowUp, Filter, ImagePlus, Settings2 } from "lucide-react";
import "../Style/chatInput.scss";
import useCustomToast from "@/hook/useCustomToast";
import CustomSlider from "./CustomSlider";

export default function ModernSearchBar({ onSubmit, onFilterClick }) {
    const { showSuccess, showError } = useCustomToast();
    const fileRef = useRef(null);
    const textFieldRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [text, setText] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isMultiline, setIsMultiline] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Initialize from sessionStorage or use defaults
    const [numResults, setNumResults] = useState(() => {
        const saved = sessionStorage.getItem('searchNumResults');
        return saved ? parseInt(saved, 10) : 10;
    });
    const [accuracy, setAccuracy] = useState(() => {
        const saved = sessionStorage.getItem('searchAccuracy');
        return saved ? parseInt(saved, 10) : 40;
    });

    // Save to sessionStorage whenever values change
    useEffect(() => {
        sessionStorage.setItem('searchNumResults', numResults.toString());
    }, [numResults]);

    useEffect(() => {
        sessionStorage.setItem('searchAccuracy', accuracy.toString());
    }, [accuracy]);

    const handleUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handlePaste = (e) => {
        for (const item of e.clipboardData.items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
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
        };

        const handleWindowDragLeave = (e) => {
            e.preventDefault();
            // Only hide overlay when leaving window (not when entering children)
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
    };

    const clearInput = () => {
        setText("");
        setImageFile(null);
        setImagePreview(null);
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

    const handleFilter = () => {
        if (onFilterClick) {
            onFilterClick();
        }
    };

    return (
        <>
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
                className="chat-input-container"
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >

                {imagePreview && (
                    <Box className="image-preview-wrapper">
                        <Box className="image-preview">
                            <img src={imagePreview} alt="preview" />
                            <Tooltip title="Remove image">
                                <IconButton
                                    size="small"
                                    className="remove-image"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImageFile(null);
                                    }}
                                >
                                    <X size={14} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                )}

                <Box className={isMultiline ? "chat-input-inline-multi" : "chat-input-inline-single"}>
                    <Box className="text-row">
                        {!isMultiline && (
                            <>
                                <Tooltip title="Upload image">
                                    <IconButton onClick={() => fileRef.current.click()} className="upload-btn">
                                        <ImagePlus size={22} />
                                    </IconButton>
                                </Tooltip>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleUpload}
                                />
                            </>
                        )}
                        <TextField
                            placeholder="Ask anything…"
                            variant="standard"
                            fullWidth={!isMultiline}
                            sx={{ width: isMultiline ? '100% !important' : '370px !important' }}
                            multiline
                            maxRows={10}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setIsMultiline(e.target.value.includes('\n') || e.target.value.length > 42);
                            }}
                            onKeyDown={handleKeyDown}
                            className="chat-textarea"
                            inputRef={textFieldRef}
                            InputProps={{ disableUnderline: true }}
                        />
                    </Box>
                    <Box className="buttons-row">
                        {isMultiline && (
                            <div className="upload-btn-div">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleUpload}
                                />
                                <Tooltip title="Upload image">
                                    <IconButton onClick={() => fileRef.current.click()} className="upload-btn">
                                        <ImagePlus size={22} />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        )}
                        <div className="btns-row-div">
                            <Tooltip title="Settings">
                                <IconButton
                                    className="settings-btn"
                                    sx={{
                                        color: isSettingsOpen ? 'primary.main' : 'text.secondary',
                                        transition: 'color 0.2s'
                                    }}
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                >
                                    <Settings2 size={22} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Filter">
                                <IconButton className="filter-btn" onClick={handleFilter}>
                                    <Filter size={22} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Send">
                                <IconButton className="send-btn" onClick={handleSend}>
                                    <ArrowUp size={20} />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </Box>
                </Box>

                {/* Inline Settings - Expands below input */}
                {isSettingsOpen && (
                    <Box
                        sx={{
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            animation: 'slideDown 0.3s ease-in-out',
                            '@keyframes slideDown': {
                                from: {
                                    opacity: 0,
                                    transform: 'translateY(-10px)'
                                },
                                to: {
                                    opacity: 1,
                                    transform: 'translateY(0)'
                                }
                            }
                        }}
                    >
                        <Box sx={{
                            p: '10px 10px 0px 10px',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 3,
                            alignItems: 'center'
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
                    </Box>
                )}
            </Paper>
        </>
    );
}

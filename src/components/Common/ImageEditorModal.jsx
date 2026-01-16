'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Box,
    Typography,
    Slider,
    IconButton,
    Divider,
    Tooltip,
    useTheme,
    useMediaQuery,
    Slide,
    alpha,
    Paper,
} from '@mui/material';
import {
    X,
    RotateCw,
    FlipHorizontal,
    FlipVertical,
    Crop,
    Undo2,
    Redo2,
    Save,
    Image as ImageIcon,
    Eraser,
    Pencil,
    // Loader2 // Removed
    Maximize,
    Minimize
} from 'lucide-react';
import { processingService } from '@/services/processingService';
import { toast } from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';

const DEFAULTS = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    canvasBgColor: 'transparent'
};

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ImageEditorModal = React.memo(function ImageEditorModal({
    open = false,
    onClose,
    imageFile = null,
    onSave,
    title = "Edit Image",
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [manualFullScreen, setManualFullScreen] = useState(false);
    const fullScreen = isMobile || manualFullScreen;

    const canvasRef = useRef(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    // History State for Undo/Redo
    // Items: { adjustments: Object, image: HTMLImageElement }
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Derived current state
    const currentHistoryItem = history[historyIndex];
    const adjustments = currentHistoryItem?.adjustments || DEFAULTS;

    // Sync active image from history
    useEffect(() => {
        if (currentHistoryItem?.image) {
            setOriginalImage(currentHistoryItem.image);
        }
    }, [currentHistoryItem]);

    // Crop state
    const [cropMode, setCropMode] = useState(false);
    const [cropArea, setCropArea] = useState({
        x: 50,
        y: 50,
        width: 200,
        height: 200
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const cropContainerRef = useRef(null);

    // Rotation State
    const [isRotating, setIsRotating] = useState(false);
    const [rotationStartAngle, setRotationStartAngle] = useState(0);
    const [baseRotation, setBaseRotation] = useState(0);

    // Effect to center 1:1 crop when enabled
    useEffect(() => {
        if (cropMode && cropContainerRef.current) {
            const rect = cropContainerRef.current.getBoundingClientRect();
            // Use 80% of the smaller dimension for initial crop square
            const minDim = Math.min(rect.width, rect.height) * 0.8;

            setCropArea({
                width: minDim,
                height: minDim,
                x: (rect.width - minDim) / 2,
                y: (rect.height - minDim) / 2
            });
        }
    }, [cropMode]);

    // Load image when file changes or modal opens
    useEffect(() => {
        if (imageFile && open) {
            setImageLoaded(false);
            const url = URL.createObjectURL(imageFile);
            setImageUrl(url);

            const img = new Image();
            img.onload = () => {
                // Initialize history
                setHistory([{ adjustments: DEFAULTS, image: img }]);
                setHistoryIndex(0);

                setImageLoaded(true);
                // Set crop area relative to displayed canvas size initially
                setTimeout(() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        setCropArea({
                            x: rect.width * 0.1,
                            y: rect.height * 0.1,
                            width: rect.width * 0.6,
                            height: rect.height * 0.6
                        });
                    }
                }, 100);
                setCropMode(false);
            };
            img.src = url;

            return () => {
                URL.revokeObjectURL(url);
                setImageLoaded(false);
                setHistory([]);
            };
        } else if (!open) {
            // Reset state when modal closes
            setImageLoaded(false);
            setOriginalImage(null);
            setImageUrl(null);
            setCropMode(false);
            setHistory([]);
            setHistoryIndex(0);
        }
    }, [imageFile, open]);

    // Add a new state to history
    const pushToHistory = useCallback((newAdjustments, newImage = null) => {
        setHistory(prev => {
            const currentItem = prev[historyIndex];
            const nextItem = {
                adjustments: newAdjustments,
                image: newImage || currentItem?.image // Keep current image if not changing
            };
            const newHistory = prev.slice(0, historyIndex + 1);
            return [...newHistory, nextItem];
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
        }
    }, [historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
        }
    }, [historyIndex, history.length]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!open) return;

            // Check for Ctrl or Command key
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        handleRedo();
                    } else {
                        handleUndo();
                    }
                } else if (e.key === 'y') {
                    e.preventDefault();
                    handleRedo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handleUndo, handleRedo]);

    // Core rendering function
    const renderImage = useCallback((targetCanvas, sourceImage, currentAdjustments, options = {}) => {
        if (!targetCanvas || !sourceImage) return;

        const ctx = targetCanvas.getContext('2d');
        const { crop = null } = options;

        // Use original dimensions
        let renderWidth = sourceImage.width;
        let renderHeight = sourceImage.height;

        targetCanvas.width = renderWidth;
        targetCanvas.height = renderHeight;

        // Clear canvas
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

        // Fill background color if set
        if (currentAdjustments.canvasBgColor && currentAdjustments.canvasBgColor !== 'transparent') {
            ctx.fillStyle = currentAdjustments.canvasBgColor;
            ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
        }

        ctx.save();
        ctx.translate(targetCanvas.width / 2, targetCanvas.height / 2);

        // Rotation
        if (currentAdjustments.rotation !== 0) {
            ctx.rotate((currentAdjustments.rotation * Math.PI) / 180);
        }

        // Flip
        ctx.scale(
            currentAdjustments.flipH ? -1 : 1,
            currentAdjustments.flipV ? -1 : 1
        );

        // Filters (CSS-style)
        const filters = [];
        if (currentAdjustments.brightness !== 0) {
            filters.push(`brightness(${100 + currentAdjustments.brightness}%)`);
        }
        if (currentAdjustments.contrast !== 0) {
            filters.push(`contrast(${100 + currentAdjustments.contrast}%)`);
        }
        if (currentAdjustments.saturation !== 0) {
            filters.push(`saturate(${100 + currentAdjustments.saturation}%)`);
        }
        // Sharpness blur imitation for negative sharpness
        if (currentAdjustments.sharpness < 0) {
            filters.push(`blur(${Math.abs(currentAdjustments.sharpness) / 20}px)`);
        }

        if (filters.length > 0) {
            ctx.filter = filters.join(' ');
        }

        ctx.drawImage(
            sourceImage,
            -sourceImage.width / 2,
            -sourceImage.height / 2,
            sourceImage.width,
            sourceImage.height
        );

        // Manual sharpening for positive values (pixel manipulation)
        if (currentAdjustments.sharpness > 0) {
            const imageData = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
            const sharpenedData = applySharpen(imageData, currentAdjustments.sharpness / 100);
            ctx.putImageData(sharpenedData, 0, 0);
        }

        ctx.restore();

        // If we need to crop the result (e.g. for saving)
        if (crop) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = crop.width;
            tempCanvas.height = crop.height;
            const tempCtx = tempCanvas.getContext('2d');

            tempCtx.drawImage(
                targetCanvas,
                crop.x, crop.y, crop.width, crop.height,
                0, 0, crop.width, crop.height
            );

            targetCanvas.width = crop.width;
            targetCanvas.height = crop.height;
            ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
        }
    }, []);

    // Convolution-based sharpening
    const applySharpen = (imageData, amount) => {
        const { width, height, data } = imageData;
        const output = new Uint8ClampedArray(data.length);
        const a = amount;
        const b = 1 + 4 * a;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                for (let c = 0; c < 3; c++) {
                    const i = idx + c;
                    output[i] =
                        data[i] * b +
                        (data[i - 4] + data[i + 4] + data[i - width * 4] + data[i + width * 4]) * -a;
                }
                output[idx + 3] = data[idx + 3];
            }
        }
        return new ImageData(output, width, height);
    };

    // Re-render when adjustments change
    useEffect(() => {
        if (!originalImage || !canvasRef.current || !imageLoaded) return;
        renderImage(canvasRef.current, originalImage, adjustments);
    }, [originalImage, adjustments, imageLoaded, renderImage]);

    const handleSliderChangeCommitted = (type, value) => {
        const newAdjustments = { ...adjustments, [type]: value };
        pushToHistory(newAdjustments);
    };

    // Transient state for sliders (visual only)
    const [tempAdjustments, setTempAdjustments] = useState(null);

    useEffect(() => {
        setTempAdjustments(adjustments);
    }, [adjustments]);

    const onSliderMove = (type, value) => {
        setTempAdjustments(prev => ({ ...prev, [type]: value }));
        // Live render
        if (canvasRef.current && originalImage) {
            renderImage(canvasRef.current, originalImage, { ...adjustments, [type]: value });
        }
    };

    const handleRotate = useCallback(() => {
        const newVal = (adjustments.rotation + 90) % 360;
        pushToHistory({ ...adjustments, rotation: newVal });
    }, [adjustments, pushToHistory]);

    const handleFlip = useCallback((direction) => {
        pushToHistory({ ...adjustments, [direction]: !adjustments[direction] });
    }, [adjustments, pushToHistory]);


    // Processing Handler
    const [activeProcessor, setActiveProcessor] = useState(null);

    const handleProcess = useCallback(async (processorId) => {
        debugger
        if (!originalImage || !canvasRef.current) return;

        setActiveProcessor(processorId);
        try {
            const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
            const currentFile = new File([blob], "current_edit.png", { type: 'image/png' });
            const resultBlob = await processingService.processImage(processorId, currentFile);
            console.log(resultBlob)

            // Create new image from result
            const url = URL.createObjectURL(resultBlob);
            const newImg = new Image();
            newImg.onload = () => {
                pushToHistory(DEFAULTS, newImg);
                setActiveProcessor(null);
            };
            newImg.src = url;

        } catch (error) {
            console.error("Processing failed:", error);
            setActiveProcessor(null);

            toast.error(error.message || "Something went wrong during processing", {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                    fontSize: '0.875rem'
                },
                iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                },
            });
        }
    }, [originalImage, pushToHistory]);


    // Reset to initial state
    const handleReset = useCallback(() => {
        if (history.length > 0) {
            // Reset to the very first history item (original image, default adjustments)
            const initialItem = history[0];
            setHistory([initialItem]);
            setHistoryIndex(0);
            setTempAdjustments(DEFAULTS);
            setCropMode(false);
            setIsRotating(false);
        }
    }, [history]);

    // Rotation Handlers
    const calculateAngle = useCallback((clientX, clientY) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return 0;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        const radians = Math.atan2(dy, dx);
        const degrees = (radians * 180) / Math.PI;

        // Offset to match Canva style (angle 0 is at the handle position)
        return (degrees + 90 + 360) % 360;
    }, []);

    const handleRotationMouseDown = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsRotating(true);
        const startAngle = calculateAngle(e.clientX, e.clientY);
        setRotationStartAngle(startAngle);
        setBaseRotation(adjustments.rotation);
    }, [adjustments.rotation, calculateAngle]);

    const handleRotationMouseMove = useCallback((e) => {
        if (!isRotating) return;

        const currentAngle = calculateAngle(e.clientX, e.clientY);
        let angleDiff = currentAngle - rotationStartAngle;

        let newRotation = (baseRotation + angleDiff + 360) % 360;

        // Snap to grid (e.g., 5 degrees) if Shift is held
        if (e.shiftKey) {
            newRotation = Math.round(newRotation / 5) * 5;
        }

        setTempAdjustments(prev => ({ ...prev, rotation: newRotation }));
        if (canvasRef.current && originalImage) {
            renderImage(canvasRef.current, originalImage, { ...adjustments, rotation: newRotation });
        }
    }, [isRotating, rotationStartAngle, baseRotation, calculateAngle, adjustments, originalImage, renderImage]);

    const handleRotationMouseUp = useCallback(() => {
        if (isRotating) {
            setIsRotating(false);
            if (tempAdjustments.rotation !== adjustments.rotation) {
                pushToHistory({ ...adjustments, rotation: tempAdjustments.rotation });
            }
        }
    }, [isRotating, tempAdjustments, adjustments, pushToHistory]);

    // Crop Handlers
    const handleCropMouseDown = useCallback((e, handle = null) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
        } else {
            setIsDragging(true);
        }

        setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }, [cropArea]);

    const handleCropMouseMove = useCallback((e) => {
        if (!isDragging && !isResizing) return;

        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDragging) {
            const newX = Math.max(0, Math.min(x - dragStart.x, rect.width - cropArea.width));
            const newY = Math.max(0, Math.min(y - dragStart.y, rect.height - cropArea.height));
            setCropArea(prev => ({ ...prev, x: newX, y: newY }));
        } else if (isResizing && resizeHandle) {
            const minSize = 50;
            let newCrop = { ...cropArea };

            const currentR = cropArea.x + cropArea.width;
            const currentB = cropArea.y + cropArea.height;

            switch (resizeHandle) {
                case 'nw':
                    // Update Left, Top
                    const newX_nw = Math.min(Math.max(0, x), currentR - minSize);
                    newCrop.x = newX_nw;
                    newCrop.width = currentR - newX_nw;

                    const newY_nw = Math.min(Math.max(0, y), currentB - minSize);
                    newCrop.y = newY_nw;
                    newCrop.height = currentB - newY_nw;
                    break;

                case 'ne':
                    // Update Top, Right
                    const newY_ne = Math.min(Math.max(0, y), currentB - minSize);
                    newCrop.y = newY_ne;
                    newCrop.height = currentB - newY_ne;

                    const newW_ne = Math.min(Math.max(minSize, x - cropArea.x), rect.width - cropArea.x);
                    newCrop.width = newW_ne;
                    break;

                case 'sw':
                    // Update Left, Bottom
                    const newX_sw = Math.min(Math.max(0, x), currentR - minSize);
                    newCrop.x = newX_sw;
                    newCrop.width = currentR - newX_sw;

                    const newH_sw = Math.min(Math.max(minSize, y - cropArea.y), rect.height - cropArea.y);
                    newCrop.height = newH_sw;
                    break;

                case 'se':
                    // Update Right, Bottom
                    const newW_se = Math.min(Math.max(minSize, x - cropArea.x), rect.width - cropArea.x);
                    newCrop.width = newW_se;
                    const newH_se = Math.min(Math.max(minSize, y - cropArea.y), rect.height - cropArea.y);
                    newCrop.height = newH_se;
                    break;

                case 'n':
                    // Update Top
                    const newY_n = Math.min(Math.max(0, y), currentB - minSize);
                    newCrop.y = newY_n;
                    newCrop.height = currentB - newY_n;
                    break;
                case 's':
                    // Update Bottom
                    const newH_s = Math.min(Math.max(minSize, y - cropArea.y), rect.height - cropArea.y);
                    newCrop.height = newH_s;
                    break;
                case 'w':
                    // Update Left
                    const newX_w = Math.min(Math.max(0, x), currentR - minSize);
                    newCrop.x = newX_w;
                    newCrop.width = currentR - newX_w;
                    break;
                case 'e':
                    // Update Right
                    const newW_e = Math.min(Math.max(minSize, x - cropArea.x), rect.width - cropArea.x);
                    newCrop.width = newW_e;
                    break;
            }
            setCropArea(newCrop);
        }
    }, [isDragging, isResizing, dragStart, cropArea, resizeHandle]);

    const handleCropMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    }, []);

    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            handleCropMouseMove(e);
            handleRotationMouseMove(e);
        };
        const handleGlobalMouseUp = () => {
            handleCropMouseUp();
            handleRotationMouseUp();
        };

        if (isDragging || isResizing || isRotating) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [isDragging, isResizing, isRotating, handleCropMouseMove, handleCropMouseUp, handleRotationMouseMove, handleRotationMouseUp]);


    const applyCrop = useCallback(() => {
        if (!originalImage || !canvasRef.current) return;

        const displayRect = cropContainerRef.current?.getBoundingClientRect();
        if (!displayRect) return;

        // Calculate crop coordinates relative to the actual image size
        const scaleX = originalImage.width / displayRect.width;
        const scaleY = originalImage.height / displayRect.height;

        const actualCrop = {
            x: cropArea.x * scaleX,
            y: cropArea.y * scaleY,
            width: cropArea.width * scaleX,
            height: cropArea.height * scaleY
        };

        // Create new image from crop
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = actualCrop.width;
        tempCanvas.height = actualCrop.height;
        const ctx = tempCanvas.getContext('2d');

        // Draw current state (with adjustments) to temp canvas, then crop
        const currentCanvas = canvasRef.current;
        ctx.drawImage(
            currentCanvas,
            actualCrop.x, actualCrop.y, actualCrop.width, actualCrop.height,
            0, 0, actualCrop.width, actualCrop.height
        );

        const croppedUrl = tempCanvas.toDataURL();
        const newImg = new Image();
        newImg.onload = () => {
            // Push new cropped image to history
            // Reset adjustments because they are baked into the new image
            pushToHistory(DEFAULTS, newImg);
            setCropMode(false);
        };
        newImg.src = croppedUrl;

    }, [originalImage, cropArea, adjustments, pushToHistory]);


    const handleSave = useCallback(() => {
        if (!canvasRef.current) return;

        const finalize = () => {
            canvasRef.current.toBlob((blob) => {
                if (blob && onSave) {
                    const editedFile = new File([blob], imageFile.name, {
                        type: imageFile.type,
                        lastModified: Date.now()
                    });
                    onSave(editedFile);
                    onClose();
                }
            }, imageFile.type);
        };

        if (cropMode) {
            const displayRect = cropContainerRef.current?.getBoundingClientRect();
            if (displayRect && originalImage) {
                const scaleX = originalImage.width / displayRect.width;
                const scaleY = originalImage.height / displayRect.height;
                const actualCrop = {
                    x: cropArea.x * scaleX,
                    y: cropArea.y * scaleY,
                    width: cropArea.width * scaleX,
                    height: cropArea.height * scaleY
                };
                renderImage(canvasRef.current, originalImage, adjustments, { crop: actualCrop });
                setTimeout(finalize, 50);
            }
        } else {
            finalize();
        }
    }, [imageFile, onSave, onClose, cropMode, cropArea, originalImage, adjustments, renderImage]);

    const sliders = [
        { label: 'Brightness', key: 'brightness', min: -100, max: 100 },
        { label: 'Contrast', key: 'contrast', min: -100, max: 100 },
        { label: 'Saturation', key: 'saturation', min: -100, max: 100 },
        { label: 'Sharpness', key: 'sharpness', min: -100, max: 100 },
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={fullScreen ? false : "lg"}
            fullWidth
            TransitionComponent={Transition}
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    height: fullScreen ? '100%' : 'calc(90vh)',
                    maxHeight: fullScreen ? '100%' : 'calc(90vh)',
                    borderRadius: fullScreen ? 0 : 3,
                    pb: fullScreen ? '50px' : 0,
                    m: fullScreen ? 0 : 2
                }
            }}
            sx={{
                '& .MuiDialog-container': {
                    height: fullScreen ? '100%' : '94%',
                    maxHeight: fullScreen ? '100%' : '94%'
                }
            }}
        >

            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, m: 0, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight={600}>{title}</Typography>
                    {/* Process Buttons */}
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => handleProcess('bg-remover')}
                        disabled={activeProcessor !== null}
                        startIcon={activeProcessor === 'bg-remover' ? <CircularProgress size={16} color="inherit" /> : <Eraser size={16} />}
                        sx={{
                            mr: 1,
                            textTransform: 'none',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'text.primary',
                            minWidth: 'auto',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 1.5,
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                            }
                        }}
                    >
                        {activeProcessor === 'bg-remover' ? 'Processing...' : 'Remove BG'}
                    </Button>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => handleProcess('sketch')}
                        disabled={activeProcessor !== null}
                        startIcon={activeProcessor === 'sketch' ? <CircularProgress size={16} color="inherit" /> : <Pencil size={16} />}
                        sx={{
                            mr: 2,
                            textTransform: 'none',
                            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                            color: 'text.primary',
                            minWidth: 'auto',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 1.5,
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                            }
                        }}
                    >
                        {activeProcessor === 'sketch' ? 'Processing...' : 'Sketch'}
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

                    <Button
                        onClick={handleReset}
                        size="small"
                        color="error"
                        sx={{
                            textTransform: "none",
                            fontSize: 12.5,
                            color: 'text.primary',
                            whiteSpace: "nowrap",
                            minWidth: "auto",
                            flexShrink: 0,
                            textDecoration: 'underline',
                            padding: '5px 10px',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                bgcolor: theme.palette.primary.danger,
                                color: '#fff'
                            }
                        }}
                    >
                        Reset All
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Tooltip title="Undo" placement="top">
                        <span>
                            <IconButton onClick={handleUndo} disabled={historyIndex === 0}>
                                <Undo2 size={20} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Redo" placement="top">
                        <span>
                            <IconButton onClick={handleRedo} disabled={historyIndex === history.length - 1}>
                                <Redo2 size={20} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <IconButton
                        onClick={() => setManualFullScreen(!manualFullScreen)}
                        size="small"
                        sx={{ color: theme.palette.grey[500], padding: 0.5 }}
                    >
                        {fullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </IconButton>
                    <IconButton onClick={onClose}>
                        <X size={20} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'row', height: '100%', overflow: 'hidden' }}>
                {/* Canvas Area */}
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'background-color 0.3s ease'
                }}>
                    {imageUrl && imageLoaded ? (
                        <Box
                            ref={cropContainerRef}
                            sx={{
                                position: 'relative',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                minHeight: fullScreen ? '80vh' : '60vh',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                borderRadius: 2,
                                lineHeight: 0
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: fullScreen ? '80vh' : '60vh',
                                    display: 'block',
                                    borderRadius: '8px',
                                    filter: activeProcessor ? 'blur(1px) brightness(0.8)' : 'none',
                                    transition: 'filter 0.3s ease'
                                }}
                            />

                            {/* Processing Overlay & Animation */}
                            {activeProcessor && (
                                <Box sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    zIndex: 200,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    borderRadius: '8px',
                                    pointerEvents: 'none'
                                }}>
                                    {/* Scanning Line Animation */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '5px',
                                        background: 'linear-gradient(90deg, transparent, #7367f0, transparent)',
                                        boxShadow: '0 0 15px #7367f0, 0 0 5px rgba(115, 103, 240, 0.5)',
                                        animation: 'scan 2s linear infinite',
                                        zIndex: 201,
                                        '@keyframes scan': {
                                            '0%': { top: '0%' },
                                            '100%': { top: '100%' }
                                        }
                                    }} />

                                    {/* Pulse Effect */}
                                    <Box sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        animation: 'pulse-bg 1.5s ease-in-out infinite',
                                        '@keyframes pulse-bg': {
                                            '0%': { opacity: 0.3 },
                                            '50%': { opacity: 0.7 },
                                            '100%': { opacity: 0.3 }
                                        }
                                    }} />
                                </Box>
                            )}

                            {/* Crop Overlay */}
                            {cropMode && (
                                <>
                                    <Box sx={{
                                        position: 'absolute', inset: 0,
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        clipPath: `polygon(
                                          0% 0%, 0% 100%, 
                                          ${cropArea.x}px 100%, ${cropArea.x}px ${cropArea.y}px, 
                                          ${cropArea.x + cropArea.width}px ${cropArea.y}px, ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px, 
                                          ${cropArea.x}px ${cropArea.y + cropArea.height}px, ${cropArea.x}px 100%, 
                                          100% 100%, 100% 0%
                                        )`
                                    }} />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: cropArea.x, top: cropArea.y,
                                            width: cropArea.width, height: cropArea.height,
                                            backgroundColor: 'transparent',
                                            border: '2px solid #7367f0',
                                            cursor: 'move',
                                            '&:hover': {
                                                borderColor: '#6c5ce7'
                                            }
                                        }}
                                        onMouseDown={(e) => handleCropMouseDown(e)}
                                    >
                                        {/* Handles */}
                                        {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map(h => (
                                            <Box key={h}
                                                sx={{
                                                    position: 'absolute',
                                                    width: '15px',
                                                    height: '15px',
                                                    backgroundColor: '#7367f0', // Reference color
                                                    border: '2px solid white', // Reference border
                                                    borderRadius: '50%',
                                                    top: h.includes('n') ? -10 : h === 'w' || h === 'e' ? 'calc(50% - 10px)' : 'auto',
                                                    bottom: h.includes('s') ? -10 : 'auto',
                                                    left: h.includes('w') ? -10 : h === 'n' || h === 's' ? 'calc(50% - 10px)' : 'auto',
                                                    right: h.includes('e') ? -10 : 'auto',
                                                    cursor: `${h}-resize`,
                                                    zIndex: 10,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                    transition: 'all 0.2s ease', // Reference transition
                                                    '&:hover': {
                                                        backgroundColor: '#6c5ce7',
                                                        transform: 'scale(1.2)'
                                                    }
                                                }}
                                                onMouseDown={(e) => handleCropMouseDown(e, h)}
                                            />
                                        ))}

                                        {/* Crop info overlay */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '-30px',
                                                left: '0',
                                                backgroundColor: 'rgba(0,0,0,0.8)',
                                                color: 'white',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                whiteSpace: 'nowrap',
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                                        </Box>
                                    </Box>
                                </>
                            )}

                            <Box
                                onMouseDown={handleRotationMouseDown}
                                sx={{
                                    position: 'absolute',
                                    bottom: -40,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    cursor: isRotating ? 'grabbing' : 'grab',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    zIndex: 100,
                                    '&:hover .rotate-icon': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            >
                                <Paper
                                    className="rotate-icon"
                                    elevation={3}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: isRotating ? 'primary.main' : 'white',
                                        color: isRotating ? 'white' : 'text.primary',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <RotateCw size={18} />
                                </Paper>

                                {isRotating && (
                                    <Paper
                                        elevation={2}
                                        sx={{
                                            position: 'absolute',
                                            top: 40,
                                            bgcolor: 'rgba(0,0,0,0.75)',
                                            color: 'white',
                                            p: 1,
                                            borderRadius: 1,
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        {Math.round(tempAdjustments?.rotation || 0)}°
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        <Typography>Loading...</Typography>
                    )}
                </Box>

                {/* Controls */}
                <Box sx={{
                    width: 320,
                    bgcolor: '#fff',
                    borderLeft: '1px solid #eee',
                    borderTop: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    flexShrink: 0
                }}>
                    <Box sx={{ p: 3 }}>
                        {/* Tools */}
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>TOOLS</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleRotate}
                                startIcon={<RotateCw size={16} />}
                                sx={{ flex: 1, minWidth: '80px' }}
                            >
                                Rotate
                            </Button>
                            <Button
                                variant={cropMode ? "contained" : "outlined"}
                                color={cropMode ? "primary" : "inherit"}
                                size="small"
                                onClick={() => cropMode ? setCropMode(false) : setCropMode(true)}
                                startIcon={cropMode ? <X size={16} /> : <Crop size={16} />}
                                sx={{
                                    flex: 1,
                                    minWidth: '80px',
                                    borderColor: cropMode ? '' : 'rgba(0,0,0,0.23)',
                                    backgroundColor: cropMode ? theme.palette.error.main : ''
                                }}
                            >
                                {cropMode ? "Cancel" : "Crop"}
                            </Button>
                            {cropMode && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={applyCrop}
                                    startIcon={<CheckIcon size={16} />}
                                    sx={{ flex: 1, minWidth: '80px' }}
                                >
                                    Apply
                                </Button>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                onClick={() => handleFlip('flipH')}
                                startIcon={<FlipHorizontal size={16} />}
                            >
                                Flip H
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                onClick={() => handleFlip('flipV')}
                                startIcon={<FlipVertical size={16} />}
                            >
                                Flip V
                            </Button>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Sliders */}
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>ADJUSTMENTS</Typography>
                        {sliders.map(s => (
                            <Box key={s.key} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">{s.label}</Typography>
                                    <Typography variant="caption" color="primary" fontWeight="bold">
                                        {tempAdjustments ? tempAdjustments[s.key] : 0}
                                    </Typography>
                                </Box>
                                <Slider
                                    value={tempAdjustments ? tempAdjustments[s.key] : 0}
                                    min={s.min}
                                    max={s.max}
                                    onChange={(_, v) => onSliderMove(s.key, v)}
                                    onChangeCommitted={(_, v) => handleSliderChangeCommitted(s.key, v)}
                                    size="small"
                                />
                            </Box>
                        ))}

                    </Box>

                    <Box sx={{ mt: 'auto', p: 3, borderTop: '1px solid #eee' }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleSave}
                            startIcon={<Save size={18} />}
                            sx={{ borderRadius: 2 }}
                        >
                            Apply Changes
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
});

// Helper for 'Apply Crop' button icon
function CheckIcon({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

export default ImageEditorModal;

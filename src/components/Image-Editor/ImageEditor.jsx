"use client"
import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    Tab,
    Tabs,
    Typography,
    Slider,
    Select,
    MenuItem,
    FormControl,
    alpha,
    Slide,
    Fade,
} from '@mui/material';
import {
    RotateCw,
    Crop,
    Scissors,
    FlipHorizontal,
    Paintbrush,
    Type,
    RefreshCw,
    Undo,
    Redo,
    X as CloseIcon,
    Save,
    Palette,
    Wand2,
    Eraser,
    Pencil,
    Maximize,
    Minimize,
} from 'lucide-react';

import { processingService } from '@/services/processingService';
import { toast } from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';

import { useImageEditor } from './useImageEditor';
import { TextProperties, BrushProperties } from './EditorComponents';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ImageEditor = ({ open, onClose, initialImage }) => {
    const {
        canvasRef, txtEditorRef, cwRef, isImageReady, tab, setTab, drawMode, setDrawMode, textMode, setTextMode, cropMode, setCropMode,
        adj, setAdj, activeFx, setActiveFx, brushColor, setBrushColor, brushSize, setBrushSize, brushOpacity, setBrushOpacity,
        rotation, setRotation, flipH, setFlipH, flipV, setFlipV,
        crop, setCrop, texts, setTexts, selTxt, setSelTxt, editTxt, setEditTxt, history, histIdx, setHistIdx, setDrawings,
        cutMode, setCutMode, cut, setCut, cuts, setCuts, selCut, setSelCut,
        handleMouseDown, handleMouseMove, handleMouseUp, handleApplyCrop, handleApplyCut, handleAddText, handleTextDblClick, handleRotate, handleFlipH, handleFlipV, handleFileFunc,
        handleApplyFilter, undo, redo, pushHistory, fitCanvas, getTextBB, removeImage, applyProcessedImage
    } = useImageEditor(initialImage, open);

    const [isDragging, setIsDragging] = React.useState(false);
    const rotationTimeoutRef = React.useRef(null);
    const [previewRotation, setPreviewRotation] = React.useState(rotation);
    const [activeProcessor, setActiveProcessor] = React.useState(null);
    const [lastProcessor, setLastProcessor] = React.useState('bg-remover');
    const [isFullScreen, setIsFullScreen] = React.useState(true);

    const [isCanvasRotDrag, setIsCanvasRotDrag] = React.useState(false);
    const canvasRotRef = React.useRef({ startAngle: 0, initialRot: 0, currentRot: 0 });

    React.useEffect(() => {
        canvasRotRef.current.currentRot = previewRotation;
    }, [previewRotation]);

    React.useEffect(() => {
        setPreviewRotation(rotation);
    }, [rotation]);

    const handleProcess = React.useCallback(async (processorId) => {
        if (!canvasRef.current) return;

        setActiveProcessor(processorId);
        setLastProcessor(processorId);
        try {
            const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
            const currentFile = new File([blob], "current_edit.png", { type: 'image/png' });
            const resultBlob = await processingService.processImage(processorId, currentFile);

            const url = URL.createObjectURL(resultBlob);
            applyProcessedImage(url, processorId === 'bg-remover' ? 'Remove BG' : 'Sketch Filter');
            setActiveProcessor(null);
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
    }, [handleFileFunc]);

    const handleDrag = (e, val) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(val);
    };

    const localMouseDown = (e, dir = null) => {
        if (dir === 'main-rot') {
            e.preventDefault();
            e.stopPropagation();
            if (!canvasRef.current || !cwRef.current) return;
            const r = cwRef.current.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

            setIsCanvasRotDrag(true);
            canvasRotRef.current = { startAngle: angle, initialRot: previewRotation, currentRot: previewRotation };
            return;
        }
        handleMouseDown(e, dir);
    };

    React.useEffect(() => {
        const handleWndMouseMove = (e) => {
            if (isCanvasRotDrag && cwRef.current) {
                const r = cwRef.current.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
                let delta = currentAngle - canvasRotRef.current.startAngle;

                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;

                let nextRot = canvasRotRef.current.initialRot + delta;
                if (Math.abs(nextRot % 90) < 5) nextRot = Math.round(nextRot / 90) * 90;

                while (nextRot > 180) nextRot -= 360;
                while (nextRot < -180) nextRot += 360;

                setPreviewRotation(Math.round(nextRot));
            }
        };

        const handleWndMouseUp = () => {
            if (isCanvasRotDrag) {
                setIsCanvasRotDrag(false);
                setRotation(canvasRotRef.current.currentRot);
                pushHistory('Rotation');
            }
        };

        if (isCanvasRotDrag) {
            window.addEventListener('mousemove', handleWndMouseMove);
            window.addEventListener('mouseup', handleWndMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleWndMouseMove);
            window.removeEventListener('mouseup', handleWndMouseUp);
        };
    }, [isCanvasRotDrag, setRotation, pushHistory, setPreviewRotation]);

    const handleDropLocal = (e) => {
        handleDrag(e, false);
        const file = e.dataTransfer?.files?.[0];
        if (file) handleFileFunc(file);
    };

    const ToolBtn = ({ active, onClick, icon, label, minWidth = 80 }) => (
        <Button
            onClick={onClick}
            variant="outlined"
            sx={{
                height: 34, borderRadius: '8px', borderColor: active ? '#7367f0' : 'rgba(47, 43, 61, 0.12)',
                color: active ? '#fff' : '#2f2b3d',
                backgroundColor: active ? '#7367f0' : '#fff',
                '&:hover': { borderColor: '#7367f0', backgroundColor: active ? '#7367f0' : 'rgba(115,103,240,0.08)' },
                textTransform: 'none', fontSize: 12, fontWeight: 600, gap: 1, boxShadow: active ? '0 2px 4px rgba(115,103,240,0.4)' : 'none',
                minWidth: minWidth, px: 1.5
            }}
            startIcon={icon ? React.cloneElement(icon, { size: 14 }) : null}
        >
            {label}
        </Button>
    );

    return (
        <Dialog
            open={open} onClose={onClose} maxWidth={isFullScreen ? false : "lg"} fullWidth
            TransitionComponent={Transition}
            fullScreen={isFullScreen}
            PaperProps={{
                sx: {
                    height: isFullScreen ? '100%' : 'calc(90vh)',
                    maxHeight: isFullScreen ? '100%' : 'calc(90vh)',
                    borderRadius: isFullScreen ? 0 : 3,
                    pb: isFullScreen ? '50px' : 0,
                    m: isFullScreen ? 0 : 2
                }
            }}
            sx={{
                '& .MuiDialog-container': {
                    height: isFullScreen ? '100%' : '94%',
                    maxHeight: isFullScreen ? '100%' : '94%'
                },
                '& .MuiBackdrop-root': { backgroundColor: 'rgba(47, 43, 61, 0.4)', backdropFilter: 'blur(4px)' },
            }}
        >
            <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2, py: 1.25, borderBottom: '1px solid rgba(47, 43, 61, 0.12)', flexShrink: 0, backgroundColor: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7367f0', boxShadow: '0 0 10px rgba(115,103,240,0.35)' }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2f2b3d' }}>Image Editor</Typography>
                        <Button
                            onClick={() => handleProcess('bg-remover')}
                            disabled={activeProcessor !== null}
                            variant="text"
                            startIcon={activeProcessor === 'bg-remover' ? <CircularProgress size={16} color="inherit" /> : <Eraser size={16} />}
                            sx={{
                                mr: 1,
                                textTransform: 'none',
                                bgcolor: alpha('#7367f0', 0.1),
                                color: '#2f2b3d',
                                minWidth: 'auto',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 1.5,
                                '&:hover': {
                                    bgcolor: alpha('#7367f0', 0.15),
                                }
                            }}
                        >
                            {activeProcessor === 'bg-remover' ? 'Processing...' : 'Remove BG'}
                        </Button>
                        <Button
                            onClick={() => handleProcess('sketch')}
                            disabled={activeProcessor !== null}
                            variant="text"
                            startIcon={activeProcessor === 'sketch' ? <CircularProgress size={16} color="inherit" /> : <Pencil size={16} />}
                            sx={{
                                mr: 2,
                                textTransform: 'none',
                                bgcolor: alpha('#28c76f', 0.1),
                                color: '#2f2b3d',
                                minWidth: 'auto',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 1.5,
                                '&:hover': {
                                    bgcolor: alpha('#28c76f', 0.15),
                                }
                            }}
                        >
                            {activeProcessor === 'sketch' ? 'Processing...' : 'Sketch'}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Button
                            onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); setAdj({ br: 0, co: 0, sa: 0, sh: 0 }); setActiveFx(null); setTexts([]); setDrawings([]); setSelTxt(null); setEditTxt(null); fitCanvas(); }}
                            sx={{ textTransform: 'none', color: '#6d6b77', fontSize: 13, borderRadius: '6px', px: 1.5, '&:hover': { color: '#ea5455', backgroundColor: 'rgba(234,84,85,0.08)' } }}
                            startIcon={<RefreshCw size={18} />}
                        >
                            Reset
                        </Button>
                        {isImageReady && (
                            <Button
                                onClick={removeImage}
                                sx={{ textTransform: 'none', color: '#ea5455', fontSize: 13, borderRadius: '6px', px: 1.5, '&:hover': { backgroundColor: 'rgba(234,84,85,0.08)' } }}
                                startIcon={<CloseIcon size={18} />}
                            >
                                Remove
                            </Button>
                        )}
                        <IconButton onClick={undo} size="small" sx={{ color: '#6d6b77', '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)', color: '#2f2b3d' } }} title="Undo"><Undo size={20} /></IconButton>
                        <IconButton onClick={redo} size="small" sx={{ color: '#6d6b77', '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)', color: '#2f2b3d' } }} title="Redo"><Redo size={20} /></IconButton>
                        <IconButton onClick={() => setIsFullScreen(!isFullScreen)} size="small" sx={{ color: '#6d6b77', '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)', color: '#2f2b3d' } }} title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
                            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </IconButton>
                        <IconButton onClick={onClose} size="small" sx={{ color: '#6d6b77', '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)', color: '#2f2b3d' } }} title="Close"><CloseIcon size={20} /></IconButton>
                    </Box>
                </Box>

                {/* Body Area */}
                <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
                    {/* Canvas Side */}
                    <Box
                        id="carea"
                        onDragOver={e => handleDrag(e, true)}
                        onDragEnter={e => handleDrag(e, true)}
                        onDragLeave={e => handleDrag(e, false)}
                        onDrop={handleDropLocal}
                        sx={{
                            flex: 1, minWidth: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: '#f8f7fa',
                            backgroundImage: 'radial-gradient(circle at 20% 20%,rgba(115,103,240,.03) 0,transparent 55%),radial-gradient(circle at 80% 80%,rgba(206,159,252,.02) 0,transparent 55%)',
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(47, 43, 61,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(47, 43, 61,.03) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                        {isDragging && (
                            <Box sx={{ position: 'absolute', inset: 16, zIndex: 60, borderRadius: '16px', border: '3px dashed #7367f0', backgroundColor: 'rgba(115,103,240,0.08)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite ease-in-out', '@keyframes pulse': { '0%': { opacity: 0.6, transform: 'scale(1)' }, '50%': { opacity: 1, transform: 'scale(0.99)' }, '100%': { opacity: 0.6, transform: 'scale(1)' } } }}>
                                <Typography sx={{ color: '#7367f0', fontWeight: 700, fontSize: 24, letterSpacing: 1 }}>DROP TO IMPORT</Typography>
                            </Box>
                        )}

                        {!isImageReady ? (
                            <Box sx={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, zIndex: 50,
                                width: 480, p: 6, borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 50px rgba(47, 43, 61, 0.08)'
                            }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Box sx={{ width: 100, height: 100, borderRadius: '30px', backgroundColor: 'rgba(115,103,240,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7367f0', transform: 'rotate(-5deg)', transition: 'transform 0.3s ease', '&:hover': { transform: 'rotate(0deg) scale(1.05)' } }}>
                                        <Save size={44} />
                                    </Box>
                                    <Box sx={{ position: 'absolute', bottom: -8, right: -8, width: 44, height: 44, borderRadius: '14px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#7367f0' }}>
                                        <Paintbrush size={22} />
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#2f2b3d', letterSpacing: '-0.5px' }}>Drop image here</Typography>
                                    <Typography sx={{ fontSize: 14, color: '#6d6b77', mt: 1, fontWeight: 500 }}>Support for PNG · JPG · WEBP · GIF</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <Box sx={{ height: 1, width: 24, backgroundColor: 'rgba(47, 43, 61, 0.1)' }} />
                                        <Typography sx={{ fontSize: 12, color: '#a5a3ae', fontWeight: 600, textTransform: 'uppercase' }}>or</Typography>
                                        <Box sx={{ height: 1, width: 24, backgroundColor: 'rgba(47, 43, 61, 0.1)' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                                    <Button component="label" variant="contained" sx={{ borderRadius: '12px', py: 1.75, textTransform: 'none', fontWeight: 700, fontSize: 15, backgroundColor: '#7367f0', '&:hover': { backgroundColor: '#6459d8', transform: 'translateY(-2px)' }, transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(115,103,240,0.3)' }}>
                                        Browse Files
                                        <input hidden type="file" accept="image/*" onChange={e => handleFileFunc(e.target.files?.[0])} />
                                    </Button>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#6d6b77' }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Pro Tip:</Typography>
                                        <Typography sx={{ fontSize: 12, fontWeight: 500, backgroundColor: 'rgba(47, 43, 61, 0.05)', px: 1, py: 0.25, borderRadius: '4px' }}>Ctrl + V</Typography>
                                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>to paste from clipboard</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ) : null}

                        <Box ref={cwRef} onMouseDown={localMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={handleTextDblClick} sx={{ position: 'relative', lineHeight: 0, borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', cursor: drawMode ? 'crosshair' : textMode ? 'text' : 'default', border: '1px solid rgba(47, 43, 61, 0.08)', display: isImageReady ? 'block' : 'none' }}>
                            <canvas ref={canvasRef} style={{ borderRadius: '16px', position: 'relative', zIndex: 1, backgroundColor: '#fff', transform: `rotate(${previewRotation - rotation}deg)` }} />
                            {isImageReady && !cropMode && !cutMode && !drawMode && !textMode && !activeProcessor && (
                                <Box
                                    onMouseDown={(e) => localMouseDown(e, 'main-rot')}
                                    sx={{
                                        position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)',
                                        width: 36, height: 36, borderRadius: '50%', backgroundColor: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 6px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(47, 43, 61, 0.08)',
                                        cursor: isCanvasRotDrag ? 'grabbing' : 'grab', zIndex: 50,
                                        '&:hover': { transform: 'translateY(-50%) scale(1.05)' }, transition: isCanvasRotDrag ? 'none' : 'transform 0.15s ease'
                                    }}
                                >
                                    <RotateCw size={18} color="#7367f0" />
                                    {isCanvasRotDrag && (
                                        <Box sx={{
                                            position: 'absolute', right: '100%', mr: 1, backgroundColor: '#2f2b3d',
                                            color: '#fff', fontSize: 13, fontWeight: 700, px: 1, p: 1,
                                            borderRadius: '6px', whiteSpace: 'nowrap', pointerEvents: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                        }}>
                                            {previewRotation}°
                                        </Box>
                                    )}
                                </Box>
                            )}
                            <div
                                ref={txtEditorRef}
                                contentEditable
                                spellCheck={false}
                                onInput={e => setTexts(prev => prev.map(t => t.id === editTxt ? { ...t, text: e.target.innerText } : t))}
                                onBlur={() => { setEditTxt(null); pushHistory('Edit Text'); }}
                                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.target.blur(); } }}
                                style={{
                                    position: 'absolute', display: editTxt ? 'inline-block' : 'none', zIndex: 20,
                                    outline: 'none', background: 'transparent', color: 'transparent',
                                    padding: '2px 0', border: '1px dashed #7367f0', borderRadius: '2px',
                                    caretColor: '#7367f0', whiteSpace: 'pre',
                                    overflow: 'hidden', cursor: 'text', minWidth: '1px', transformOrigin: '0 0'
                                }}
                            />
                            {selTxt && !editTxt && (() => {
                                const t = texts.find(tx => tx.id === selTxt);
                                if (!t) return null;
                                const bb = getTextBB(t);
                                const r = canvasRef.current.getBoundingClientRect();
                                const scale = r.width / canvasRef.current.width;
                                return (
                                    <Box
                                        sx={{
                                            position: 'absolute', zIndex: 10, pointerEvents: 'none',
                                            border: '1px dashed #7367f0', borderRadius: '2px',
                                            left: bb.x * scale, top: bb.y * scale,
                                            width: bb.w * scale, height: bb.h * scale,
                                            transform: `rotate(${t.rotation}deg)`,
                                            transformOrigin: `${(t.x - bb.x) * scale}px ${(t.y - bb.y) * scale}px`
                                        }}
                                    >
                                        <Box sx={{ position: 'absolute', width: '1px', height: 26, backgroundColor: '#7367f0', left: '50%', top: -26, transform: 'translateX(-50%)' }} />
                                        <Box
                                            onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'rot'); }}
                                            sx={{
                                                position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                cursor: 'crosshair', left: '50%', top: -26, transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                        {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(dir => (
                                            <Box
                                                key={dir}
                                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, dir); }}
                                                sx={{
                                                    position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                    border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                    cursor: dir.includes('w') && dir.includes('n') ? 'nwse-resize' :
                                                        dir.includes('e') && dir.includes('s') ? 'nwse-resize' :
                                                            dir.includes('e') && dir.includes('n') ? 'nesw-resize' :
                                                                dir.includes('w') && dir.includes('s') ? 'nesw-resize' :
                                                                    dir.includes('n') || dir.includes('s') ? 'ns-resize' : 'ew-resize',
                                                    left: dir.includes('e') ? '100%' : dir.includes('w') ? '0' : '50%',
                                                    top: dir.includes('s') ? '100%' : dir.includes('n') ? '0' : '50%',
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                );
                            })()}
                            {cropMode && (
                                <Box
                                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
                                    sx={{
                                        position: 'absolute', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        left: crop.w > 0 ? crop.x : crop.x + crop.w, top: crop.h > 0 ? crop.y : crop.y + crop.h,
                                        width: Math.abs(crop.w), height: Math.abs(crop.h),
                                        border: '2px solid #7367f0', backgroundColor: 'rgba(115,103,240,0.1)',
                                        boxShadow: '0 0 0 4000px rgba(0,0,0,0.3)', pointerEvents: 'auto', cursor: 'move'
                                    }}
                                >
                                    <Button onClick={handleApplyCrop} variant="contained" size="small" sx={{ backgroundColor: '#7367f0', pointerEvents: 'auto', fontSize: 10, height: 24, minWidth: 60, zIndex: 35 }}>Apply</Button>
                                    {crop.w !== 0 && crop.h !== 0 && ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(dir => (
                                        <Box
                                            key={dir}
                                            onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, dir); }}
                                            sx={{
                                                position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                cursor: dir.includes('w') && dir.includes('n') ? 'nwse-resize' :
                                                    dir.includes('e') && dir.includes('s') ? 'nwse-resize' :
                                                        dir.includes('e') && dir.includes('n') ? 'nesw-resize' :
                                                            dir.includes('w') && dir.includes('s') ? 'nesw-resize' :
                                                                dir.includes('n') || dir.includes('s') ? 'ns-resize' : 'ew-resize',
                                                left: dir.includes('e') ? '100%' : dir.includes('w') ? '0' : '50%',
                                                top: dir.includes('s') ? '100%' : dir.includes('n') ? '0' : '50%',
                                                transform: 'translate(-50%, -50%)', zIndex: 40
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                            {cutMode && (
                                <Box
                                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
                                    sx={{
                                        position: 'absolute', zIndex: 30,
                                        left: cut.w > 0 ? cut.x : cut.x + cut.w, top: cut.h > 0 ? cut.y : cut.y + cut.h,
                                        width: Math.abs(cut.w), height: Math.abs(cut.h),
                                        border: '2px dashed #7367f0', backgroundColor: 'rgba(115,103,240,0.1)',
                                        pointerEvents: 'auto', cursor: 'move'
                                    }}
                                />
                            )}
                            {cuts.map(c => (
                                <Box
                                    key={c.id}
                                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
                                    sx={{
                                        position: 'absolute', zIndex: 25,
                                        left: c.x, top: c.y, width: c.w, height: c.h,
                                        border: selCut === c.id ? '2px solid #7367f0' : 'none',
                                        pointerEvents: 'auto', cursor: 'move'
                                    }}
                                />
                            ))}
                            <Fade in={!!activeProcessor} timeout={400} unmountOnExit>
                                <Box sx={{
                                    position: 'absolute', inset: 0, zIndex: 100,
                                    backgroundColor: 'rgba(255,255,255,0.85)',
                                    backdropFilter: 'blur(8px)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '4px'
                                }}>
                                    <Box sx={{
                                        width: 80, height: 80, borderRadius: '50%', backgroundColor: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 10px 40px rgba(115,103,240,0.3)', mb: 3,
                                        position: 'relative'
                                    }}>
                                        <CircularProgress size={88} thickness={2} sx={{ color: (activeProcessor || lastProcessor) === 'bg-remover' ? '#7367f0' : '#28c76f', position: 'absolute' }} />
                                        {(activeProcessor || lastProcessor) === 'bg-remover' ? <Eraser size={32} color="#7367f0" /> : <Pencil size={32} color="#28c76f" />}
                                    </Box>
                                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#2f2b3d', mb: 1, letterSpacing: '-0.5px' }}>
                                        {(activeProcessor || lastProcessor) === 'bg-remover' ? 'Removing Background' : 'Drawing Sketch'}
                                    </Typography>
                                    <Typography sx={{ fontSize: 14, color: '#6d6b77', fontWeight: 500 }}>
                                        Applying AI magic to your image...
                                    </Typography>
                                </Box>
                            </Fade>
                        </Box>
                    </Box>

                    {/* Panel Side */}
                    <Box sx={{ width: 350, flexShrink: 0, borderLeft: '1px solid rgba(47, 43, 61, 0.12)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <Tabs
                            value={tab} onChange={(_, v) => setTab(v)}
                            sx={{
                                borderBottom: '1px solid rgba(47, 43, 61, 0.12)', minHeight: 46,
                                '& .MuiTab-root': { minHeight: 46, textTransform: 'none', fontSize: 13, color: '#6d6b77', fontWeight: 600 },
                                '& .Mui-selected': { color: '#7367f0 !important' },
                                '& .MuiTabs-indicator': { backgroundColor: '#7367f0', height: 2 }
                            }}
                        >
                            <Tab value="ctrl" label="Editor Controls" /><Tab value="hist" label="Session History" />
                        </Tabs>

                        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                            {tab === 'ctrl' ? (
                                <>
                                    {selTxt ? (
                                        <TextProperties selected={texts.find(t => t.id === selTxt)} onUpdate={newTxt => setTexts(prev => prev.map(t => t.id === selTxt ? newTxt : t))} onDone={() => setSelTxt(null)} pushHistory={pushHistory} lightMode={true} />
                                    ) : drawMode ? (
                                        <BrushProperties color={brushColor} size={brushSize} opacity={brushOpacity} onUpdate={(k, v) => { if (k === 'color') setBrushColor(v); else if (k === 'size') setBrushSize(v); else if (k === 'opacity') setBrushOpacity(v); }} onDone={() => setDrawMode(false)} pushHistory={pushHistory} lightMode={true} />
                                    ) : (
                                        <>
                                            <Box sx={{ px: 2, py: 2.5, borderBottom: '1px solid rgba(47, 43, 61, 0.08)' }}>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a5a3ae', mb: 2 }}>Canvas Tools</Typography>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                                    <ToolBtn label="Rotate" icon={<RotateCw />} onClick={handleRotate} />
                                                    <ToolBtn label="Crop" icon={<Crop />} active={cropMode} onClick={() => { setCropMode(!cropMode); setCutMode(false); setDrawMode(false); setTextMode(false); }} />
                                                    {/* <ToolBtn label="Cut" icon={<Scissors />} active={cutMode} onClick={() => { setCutMode(!cutMode); setCropMode(false); setDrawMode(false); setTextMode(false); }} /> */}
                                                    <ToolBtn label="Flip H" icon={<FlipHorizontal />} onClick={handleFlipH} />
                                                    <ToolBtn label="Flip V" icon={<FlipHorizontal style={{ transform: 'rotate(90deg)' }} />} onClick={handleFlipV} />
                                                    {/* <ToolBtn label="Draw" icon={<Paintbrush />} active={drawMode} onClick={() => { setDrawMode(!drawMode); setTextMode(false); setCropMode(false); setCutMode(false); }} /> */}
                                                    {/* <ToolBtn label="Text" icon={<Type />} active={textMode} onClick={() => handleAddText()} /> */}
                                                </Box>
                                            </Box>

                                            <Box sx={{ px: 2, py: 2.5, borderBottom: '1px solid rgba(47, 43, 61, 0.08)' }}>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a5a3ae', mb: 2 }}>Adjustments</Typography>
                                                {[{ k: 'br', label: 'Brightness' }, { k: 'co', label: 'Contrast' }, { k: 'sa', label: 'Saturation' }, { k: 'sh', label: 'Sharpness' }].map(it => (
                                                    <Box key={it.k} sx={{ mb: 2 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#2f2b3d' }}>{it.label}</Typography>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#7367f0' }}>{adj[it.k]}</Typography>
                                                        </Box>
                                                        <Slider
                                                            value={adj[it.k]} size="small"
                                                            onChange={(_, v) => setAdj(prev => ({ ...prev, [it.k]: v }))}
                                                            onChangeCommitted={() => pushHistory(`Adj: ${it.label}`)}
                                                            min={-100} max={100}
                                                            sx={{ py: 1, '& .MuiSlider-thumb': { width: 12, height: 12, backgroundColor: '#7367f0' }, '& .MuiSlider-track': { height: 4, backgroundColor: '#7367f0' }, '& .MuiSlider-rail': { height: 4 } }}
                                                        />
                                                    </Box>
                                                ))}
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#2f2b3d' }}>Rotation</Typography>
                                                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#7367f0' }}>{previewRotation}°</Typography>
                                                    </Box>
                                                    <Slider
                                                        value={previewRotation} size="small"
                                                        onChange={(_, v) => setPreviewRotation(v)}
                                                        onChangeCommitted={() => { setRotation(previewRotation); pushHistory('Rotation'); }}
                                                        min={-180} max={180} step={1}
                                                        sx={{ py: 1, '& .MuiSlider-thumb': { width: 12, height: 12, backgroundColor: '#7367f0' }, '& .MuiSlider-track': { height: 4, backgroundColor: '#7367f0' }, '& .MuiSlider-rail': { height: 4 } }}
                                                    />
                                                </Box>
                                            </Box>

                                            {/* <Box sx={{ px: 2, py: 2.5, borderBottom: '1px solid rgba(47, 43, 61, 0.08)' }}>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a5a3ae', mb: 2 }}>Quick Filters</Typography>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                                                    {[{ id: 'grayscale', label: 'Grayscale' }, { id: 'sepia', label: 'Sepia' }, { id: 'invert', label: 'Invert' }, { id: 'warm', label: 'Warm' }, { id: 'cool', label: 'Cool' }, { id: 'vintage', label: 'Vintage' }].map(fx => (
                                                        <ToolBtn key={fx.id} label={fx.label} active={activeFx === fx.id} onClick={() => handleApplyFilter(fx.id)} />
                                                    ))}
                                                </Box>
                                            </Box> */}

                                            <Box sx={{ px: 2, py: 3, mt: 'auto' }}>
                                                <Button
                                                    onClick={() => { if (!canvasRef.current) return; const link = document.createElement('a'); link.download = 'edited_image.png'; link.href = canvasRef.current.toDataURL('image/png'); link.click(); }}
                                                    fullWidth variant="contained" startIcon={<Save />}
                                                    sx={{ height: 48, borderRadius: '12px', backgroundColor: '#7367f0', boxShadow: '0 8px 16px rgba(115,103,240,0.3)', textTransform: 'none', fontWeight: 700, fontSize: 15, '&:hover': { backgroundColor: '#6459d8', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                                                >
                                                    Save Export
                                                </Button>
                                            </Box>
                                        </>
                                    )}
                                </>
                            ) : (
                                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#fcfcfd' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                        {history.map((item, idx) => (
                                            <Box
                                                key={idx}
                                                onClick={() => { const h = history[idx]; setDrawings(h.drawings); setTexts(h.texts); setAdj(h.adj); setRotation(h.rotation); setFlipH(h.flipH); setFlipV(h.flipV); setActiveFx(h.activeFx); setHistIdx(idx); }}
                                                sx={{
                                                    p: 1.5, borderRadius: '12px', backgroundColor: '#fff', border: '1px solid',
                                                    borderColor: idx === histIdx ? '#7367f0' : 'rgba(47, 43, 61, 0.08)',
                                                    cursor: 'pointer', transition: 'all .2s ease', display: 'flex', alignItems: 'center', gap: 2,
                                                    boxShadow: idx === histIdx ? '0 4px 12px rgba(115,103,240,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                                                    '&:hover': { borderColor: '#7367f0', transform: 'translateX(4px)' }
                                                }}
                                            >
                                                <Box sx={{ width: 44, height: 44, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8f7fa', border: '1px solid rgba(47, 43, 61, 0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {item.thumb ? <img src={item.thumb} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Save size={18} color="#a5a3ae" />}
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</Typography>
                                                    <Typography sx={{ fontSize: 11, color: '#a5a3ae' }}>{item.time} {idx === histIdx ? ' · Current' : ''}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ImageEditor;

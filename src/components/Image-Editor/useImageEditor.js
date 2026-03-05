"use client"
import { useState, useRef, useCallback, useEffect } from 'react';
import { clamp, defStyle } from './EditorUtils';

export const useImageEditor = (initialImage, open) => {
    // Refs
    const canvasRef = useRef();
    const baseCanvasRef = useRef(null); // Cached processed image
    const txtEditorRef = useRef();
    const cwRef = useRef();
    const ctx = useRef(null);
    const hIdxRef = useRef(-1);
    const loadedSrcRef = useRef(null);

    // State
    const [currentImage, setCurrentImage] = useState(initialImage || '');
    const [isImageReady, setIsImageReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState('ctrl');
    const [drawMode, setDrawMode] = useState(false);
    const [textMode, setTextMode] = useState(false);
    const [cropMode, setCropMode] = useState(false);
    const [adj, setAdj] = useState({ br: 0, co: 0, sa: 0, sh: 0 });
    const [activeFx, setActiveFx] = useState(null);
    const [isCropped, setIsCropped] = useState(false); // Track if image was cropped
    const [brushColor, setBrushColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(12);
    const [brushOpacity, setBrushOpacity] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [texts, setTexts] = useState([]);
    const [selTxt, setSelTxt] = useState(null);
    const [editTxt, setEditTxt] = useState(null);
    const [history, setHistory] = useState([]);
    const [histIdx, setHistIdx] = useState(-1);
    const [origImg, setOrigImg] = useState(null);
    const [drawings, setDrawings] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [cropDrag, setCropDrag] = useState(null);
    const [txtDrag, setTxtDrag] = useState(null);
    const [resizeDrag, setResizeDrag] = useState(null);
    const [rotDrag, setRotDrag] = useState(null);
    const [nextId, setNextId] = useState(1);
    const [cutMode, setCutMode] = useState(false);
    const [cut, setCut] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [cuts, setCuts] = useState([]);
    const [selCut, setSelCut] = useState(null);
    const [cutDrag, setCutDrag] = useState(null);
    const [holes, setHoles] = useState([]);
    const [clipboard, setClipboard] = useState(null);

    const removeImage = useCallback(() => {
        setOrigImg(null);
        setIsImageReady(false);
        setHistory([]);
        setHistIdx(-1);
        hIdxRef.current = -1;
        loadedSrcRef.current = null;
        setCurrentImage('');
        setDrawings([]);
        setTexts([]);
        setAdj({ br: 0, co: 0, sa: 0, sh: 0 });
        setActiveFx(null);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setCuts([]);
        setHoles([]);
        if (ctx.current && canvasRef.current) {
            ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, [setCurrentImage]);

    const canvasXY = useCallback((e) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const r = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / r.width;
        const scaleY = canvasRef.current.height / r.height;
        return {
            x: (e.clientX - r.left) * scaleX,
            y: (e.clientY - r.top) * scaleY,
        };
    }, []);

    const wrapText = useCallback((t) => {
        if (!ctx.current) return [t.text];
        const { text, style } = t;
        if (style.wrapW <= 0) return text.split('\n');

        const words = text.split(/(\s+)/);
        const lines = [];
        let curLine = '';

        ctx.current.save();
        ctx.current.font = `${style.bold ? 'bold ' : ''}${style.italic ? 'italic ' : ''}${style.size}px ${style.font}`;

        words.forEach(word => {
            if (word === '\n') {
                lines.push(curLine);
                curLine = '';
                return;
            }
            const testLine = curLine + word;
            let w = 0;
            if (style.letterSpacing !== 0) {
                testLine.split('').forEach(c => { w += ctx.current.measureText(c).width + style.letterSpacing; });
            } else {
                w = ctx.current.measureText(testLine).width;
            }

            if (w > style.wrapW && curLine !== '') {
                lines.push(curLine);
                curLine = word.trimStart();
            } else {
                curLine = testLine;
            }
        });
        lines.push(curLine);
        ctx.current.restore();
        return lines.filter((l, i) => l !== '' || i === 0 || text[text.indexOf(lines[i - 1]) + lines[i - 1].length] === '\n');
    }, []);

    const getTextBB = useCallback((t) => {
        if (!ctx.current) return { x: t.x, y: t.y, w: 0, h: 0 };
        ctx.current.save();
        ctx.current.font = `${t.style.bold ? 'bold ' : ''}${t.style.italic ? 'italic ' : ''}${t.style.size}px ${t.style.font}`;
        const lines = wrapText(t).map(l => t.style.upper ? l.toUpperCase() : l);
        const lh = t.style.size * t.style.lineH;
        let maxW = 0;
        lines.forEach(line => {
            let w = 0;
            if (t.style.letterSpacing !== 0) {
                line.split('').forEach(c => { w += ctx.current.measureText(c).width + t.style.letterSpacing; });
            } else {
                w = ctx.current.measureText(line).width;
            }
            if (w > maxW) maxW = w;
        });
        ctx.current.restore();
        let bx = t.x;
        const actualW = t.style.wrapW > 0 ? t.style.wrapW : Math.max(0, maxW - t.style.letterSpacing);
        if (t.style.align === 'center') bx -= actualW / 2;
        else if (t.style.align === 'right') bx -= actualW;
        return { x: bx, y: t.y - t.style.size * 0.7, w: actualW, h: lh * lines.length };
    }, [wrapText]);

    const mkThumb = useCallback(() => {
        if (!canvasRef.current) return '';
        const t = document.createElement('canvas');
        t.width = 44;
        t.height = 36;
        const tctx = t.getContext('2d');
        tctx.drawImage(canvasRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height, 0, 0, 44, 36);
        return t.toDataURL('image/jpeg', 0.75);
    }, []);

    const pushHistory = useCallback((label = 'Action', overrides = {}) => {
        const thumb = mkThumb();
        const nextIdx = hIdxRef.current + 1;
        hIdxRef.current = nextIdx;

        const snapshot = {
            label,
            thumb,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            drawings: JSON.parse(JSON.stringify(overrides.drawings || drawings)),
            texts: JSON.parse(JSON.stringify(overrides.texts || texts)),
            adj: { ...(overrides.adj || adj) },
            rotation: overrides.rotation !== undefined ? overrides.rotation : rotation,
            flipH: overrides.flipH !== undefined ? overrides.flipH : flipH,
            flipV: overrides.flipV !== undefined ? overrides.flipV : flipV,
            activeFx: overrides.activeFx !== undefined ? overrides.activeFx : activeFx,
            origImg: overrides.origImg || origImg,
            cuts: (overrides.cuts || cuts).map(c => ({ ...c })),
            holes: JSON.parse(JSON.stringify(overrides.holes || holes)),
            isImageReady
        };
        setHistory(prev => {
            const newHist = prev.slice(0, nextIdx);
            newHist.push(snapshot);
            if (newHist.length > 50) { newHist.shift(); hIdxRef.current--; }
            return newHist;
        });
        setHistIdx(hIdxRef.current);
    }, [drawings, texts, rotation, flipH, flipV, origImg, isImageReady, mkThumb, adj, activeFx]);

    const redo = useCallback(() => {
        if (histIdx >= history.length - 1) return;
        const next = history[histIdx + 1];
        setDrawings(next.drawings); setTexts(next.texts); setAdj(next.adj);
        setRotation(next.rotation); setFlipH(next.flipH); setFlipV(next.flipV);
        setOrigImg(next.origImg); setActiveFx(next.activeFx); setCuts(next.cuts || []);
        setHoles(next.holes || []);
        setHistIdx(histIdx + 1);
        hIdxRef.current = histIdx + 1;
    }, [histIdx, history]);

    const undo = useCallback(() => {
        if (histIdx <= 0) return;
        const prev = history[histIdx - 1];
        setDrawings(prev.drawings); setTexts(prev.texts); setAdj(prev.adj);
        setRotation(prev.rotation); setFlipH(prev.flipH); setFlipV(prev.flipV);
        setOrigImg(prev.origImg); setActiveFx(prev.activeFx); setCuts(prev.cuts || []);
        setHoles(prev.holes || []);
        setHistIdx(histIdx - 1);
        hIdxRef.current = histIdx - 1;
    }, [histIdx, history]);



    const applyFx = useCallback((d) => {
        for (let i = 0; i < d.length; i += 4) {
            let r = d[i], g = d[i + 1], b = d[i + 2];
            if (activeFx === 'grayscale') { const g2 = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = g2; }
            else if (activeFx === 'sepia') { const tr = r * .393 + g * .769 + b * .189, tg = r * .349 + g * .686 + b * .168, tb = r * .272 + g * .534 + b * .131; r = tr; g = tg; b = tb; }
            else if (activeFx === 'invert') { r = 255 - r; g = 255 - g; b = 255 - b; }
            else if (activeFx === 'warm') { r = clamp(r * 1.1); b = clamp(b * .88); }
            else if (activeFx === 'cool') { r = clamp(r * .88); b = clamp(b * 1.12); }
            else if (activeFx === 'vintage') { const g2 = (r + g + b) / 3; r = clamp(g2 * 1.1 + 30); g = clamp(g2 * .95 + 10); b = clamp(g2 * .8); }
            d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(b);
        }
    }, [activeFx]);

    const applyAdj = useCallback(() => {
        if (!ctx.current || !canvasRef.current) return;
        
        // Skip processing if image was cropped (adjustments already baked in) or all adjustments are at default values
        const hasAdjustments = adj.br !== 0 || adj.co !== 0 || adj.sa !== 0 || adj.sh !== 0 || activeFx !== null;
        if (isCropped || !hasAdjustments) {
            // Just cache the current canvas without processing
            if (!baseCanvasRef.current) {
                baseCanvasRef.current = document.createElement('canvas');
            }
            baseCanvasRef.current.width = canvasRef.current.width;
            baseCanvasRef.current.height = canvasRef.current.height;
            const bctx = baseCanvasRef.current.getContext('2d');
            if (bctx) {
                bctx.drawImage(canvasRef.current, 0, 0);
            }
            return;
        }
        
        const id = ctx.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const d = id.data;
        const len = d.length;
        const br = adj.br * 2.55;
        const ct = (100 + adj.co) / 100;
        const sat = (adj.sa + 100) / 100;
        for (let i = 0; i < len; i += 4) {
            let r = d[i], g = d[i + 1], b = d[i + 2];
            r += br; g += br; b += br;
            r = (r - 128) * ct + 128; g = (g - 128) * ct + 128; b = (b - 128) * ct + 128;
            const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            r = gray + (r - gray) * sat; g = gray + (g - gray) * sat; b = gray + (b - gray) * sat;
            d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(b);
        }
        if (adj.sh !== 0) {
            const src = new Uint8ClampedArray(d);
            const W = canvasRef.current.width, H = canvasRef.current.height;
            const a = Math.abs(adj.sh) / 100;
            if (adj.sh > 0) {
                for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
                    const i = (y * W + x) * 4;
                    for (let c = 0; c < 3; c++) {
                        const v = 5 * src[i + c] - src[i - 4 + c] - src[i + 4 + c] - src[(y - 1) * W * 4 + x * 4 + c] - src[(y + 1) * W * 4 + x * 4 + c];
                        d[i + c] = clamp(src[i + c] * (1 - a) + v * a);
                    }
                }
            } else {
                const rv = Math.max(1, Math.round(a * 4));
                for (let y = rv; y < H - rv; y++) for (let x = rv; x < W - rv; x++) {
                    const i = (y * W + x) * 4; let sr = 0, sg = 0, sb = 0, cnt = 0;
                    for (let dy = -rv; dy <= rv; dy++) for (let dx = -rv; dx <= rv; dx++) {
                        const j = ((y + dy) * W + (x + dx)) * 4; sr += src[j]; sg += src[j + 1]; sb += src[j + 2]; cnt++;
                    }
                    d[i] = sr / cnt; d[i + 1] = sg / cnt; d[i + 2] = sb / cnt;
                }
            }
        }
        if (activeFx) applyFx(d);
        ctx.current.putImageData(id, 0, 0);

        // Cache the result - ensure baseCanvasRef is created fresh
        if (!baseCanvasRef.current) {
            baseCanvasRef.current = document.createElement('canvas');
        }
        baseCanvasRef.current.width = canvasRef.current.width;
        baseCanvasRef.current.height = canvasRef.current.height;
        const bctx = baseCanvasRef.current.getContext('2d');
        if (bctx) {
            bctx.drawImage(canvasRef.current, 0, 0);
        }
    }, [adj, activeFx, applyFx, isCropped]);

    const drawOverlays = useCallback(() => {
        if (!ctx.current) return;
        drawings.forEach(d => {
            if (d.pts.length < 2) return;
            ctx.current.save();
            ctx.current.lineJoin = 'round'; ctx.current.lineCap = 'round';
            ctx.current.strokeStyle = d.color; ctx.current.lineWidth = d.size;
            ctx.current.globalAlpha = d.opacity;
            ctx.current.beginPath();
            ctx.current.moveTo(d.pts[0].x, d.pts[0].y);
            for (let i = 1; i < d.pts.length; i++) ctx.current.lineTo(d.pts[i].x, d.pts[i].y);
            ctx.current.stroke();
            ctx.current.restore();
        });
        texts.forEach(t => {
            ctx.current.save();
            ctx.current.translate(t.x, t.y);
            ctx.current.rotate((t.rotation * Math.PI) / 180);
            ctx.current.font = `${t.style.bold ? 'bold ' : ''}${t.style.italic ? 'italic ' : ''}${t.style.size}px ${t.style.font}`;

            // Apply Shadow
            if (t.style.shadowBlur > 0 || t.style.shadowX !== 0 || t.style.shadowY !== 0) {
                ctx.current.shadowColor = t.style.shadowColor;
                ctx.current.shadowBlur = t.style.shadowBlur;
                ctx.current.shadowOffsetX = t.style.shadowX;
                ctx.current.shadowOffsetY = t.style.shadowY;
            }

            ctx.current.fillStyle = t.style.color;
            ctx.current.strokeStyle = t.style.strokeColor;
            ctx.current.lineWidth = t.style.strokeW;
            ctx.current.textAlign = t.style.align;
            ctx.current.globalAlpha = t.style.opacity;

            const lines = wrapText(t).map(l => t.style.upper ? l.toUpperCase() : l);
            const lh = t.style.size * t.style.lineH;

            lines.forEach((line, i) => {
                const yp = i * lh;
                let lineW = 0;
                let curX = 0;

                // Character by character measurement for letter spacing
                const chars = line.split('');
                const charWidths = chars.map(c => ctx.current.measureText(c).width);
                lineW = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * t.style.letterSpacing;

                if (t.style.align === 'center') curX = -lineW / 2;
                else if (t.style.align === 'right') curX = -lineW;

                if (t.style.letterSpacing !== 0) {
                    chars.forEach((ch, ci) => {
                        if (t.style.strokeW > 0) ctx.current.strokeText(ch, curX, yp);
                        ctx.current.fillText(ch, curX, yp);
                        curX += charWidths[ci] + t.style.letterSpacing;
                    });
                } else {
                    if (t.style.strokeW > 0) ctx.current.strokeText(line, 0, yp);
                    ctx.current.fillText(line, 0, yp);
                }

                // Underline / Strikethrough
                if (t.style.underline || t.style.strike) {
                    ctx.current.save();
                    ctx.current.shadowBlur = 0; // Disable shadow for lines
                    ctx.current.shadowOffsetX = 0;
                    ctx.current.shadowOffsetY = 0;
                    ctx.current.beginPath();
                    ctx.current.strokeStyle = t.style.color;
                    ctx.current.lineWidth = Math.max(1, t.style.size / 15);

                    let lineStartX = 0;
                    if (t.style.align === 'center') lineStartX = -lineW / 2;
                    else if (t.style.align === 'right') lineStartX = -lineW;

                    if (t.style.underline) {
                        const uy = yp + t.style.size * 0.15;
                        ctx.current.moveTo(lineStartX, uy);
                        ctx.current.lineTo(lineStartX + lineW, uy);
                    }
                    if (t.style.strike) {
                        const sy = yp - t.style.size * 0.3;
                        ctx.current.moveTo(lineStartX, sy);
                        ctx.current.lineTo(lineStartX + lineW, sy);
                    }
                    ctx.current.stroke();
                    ctx.current.restore();
                }
            });
            ctx.current.restore();
        });
    }, [drawings, texts, wrapText]);

    const processBaseImage = useCallback((img = origImg, rot = rotation) => {
        if (!img || !ctx.current || !canvasRef.current) return;
        const W = canvasRef.current.width, H = canvasRef.current.height;
        ctx.current.clearRect(0, 0, W, H);
        ctx.current.save();
        ctx.current.translate(W / 2, H / 2);
        ctx.current.rotate((rot * Math.PI) / 180);
        ctx.current.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        const isRotated = rot === 90 || rot === 270;
        const dw = isRotated ? H : W, dh = isRotated ? W : H;
        ctx.current.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.current.restore();
        applyAdj();
    }, [origImg, rotation, flipH, flipV, applyAdj]);

    const renderAll = useCallback(() => {
        if (!ctx.current || !canvasRef.current || !baseCanvasRef.current) return;
        ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.current.drawImage(baseCanvasRef.current, 0, 0);

        // Draw Holes (Holes are white regions where image was cut)
        ctx.current.fillStyle = '#ffffff';
        holes.forEach(h => {
            ctx.current.fillRect(h.x, h.y, h.w, h.h);
        });

        // Draw Cuts (Floating layers)
        cuts.forEach(c => {
            if (c.img) ctx.current.drawImage(c.img, c.x, c.y, c.w, c.h);
        });

        drawOverlays();
    }, [drawOverlays, cuts, holes]);

    const drawImageToCanvas = useCallback((img, rot = rotation) => {
        if (!img || !canvasRef.current) return;
        const carea = document.getElementById('carea');
        if (!carea) return;
        if (!ctx.current) ctx.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
        const isRotated = rot === 90 || rot === 270;
        const aw = carea.clientWidth - 48, ah = carea.clientHeight - 48;
        const sw = isRotated ? img.naturalHeight : img.naturalWidth;
        const sh = isRotated ? img.naturalWidth : img.naturalHeight;
        const scale = Math.min(1, aw / sw, ah / sh);
        const displayW = Math.round(sw * scale), displayH = Math.round(sh * scale);
        canvasRef.current.width = displayW; canvasRef.current.height = displayH;
        canvasRef.current.style.width = displayW + 'px'; canvasRef.current.style.height = displayH + 'px';
        if (cwRef.current) { cwRef.current.style.width = displayW + 'px'; cwRef.current.style.height = displayH + 'px'; }
        processBaseImage(img, rot);
        renderAll();
    }, [rotation, processBaseImage, renderAll]);

    const fitCanvas = useCallback(() => { if (origImg) drawImageToCanvas(origImg); }, [origImg, drawImageToCanvas]);

    const loadFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            setOrigImg(img);
            setRotation(0); setFlipH(false); setFlipV(false);
            setAdj({ br: 0, co: 0, sa: 0, sh: 0 }); setActiveFx(null);
            setTexts([]); setSelTxt(null); setEditTxt(null); setDrawings([]);

            const initialHistory = {
                label: 'Image Loaded', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                drawings: [], texts: [], adj: { br: 0, co: 0, sa: 0, sh: 0 }, rotation: 0, flipH: false, flipV: false, activeFx: null, origImg: img, isImageReady: true
            };
            setHistory([initialHistory]);
            setHistIdx(0);
            hIdxRef.current = 0;

            setTimeout(() => { drawImageToCanvas(img, 0); setIsImageReady(true); }, 80);
        };
        img.onerror = () => { URL.revokeObjectURL(url); console.error('Failed to load image'); };
        img.src = url;
    }, [drawImageToCanvas]);

    const handleMouseDown = (e, dir = null) => {
        const { x, y } = canvasXY(e);
        if (dir && selTxt) {
            const t = texts.find(tx => tx.id === selTxt);
            if (t) {
                if (dir === 'rot') {
                    setRotDrag({ id: t.id, startX: x, startY: y, initialRotation: t.rotation });
                } else {
                    setResizeDrag({ dir, startX: x, startY: y, initialSize: t.style.size, initialWrapW: t.style.wrapW, id: t.id });
                }
                return;
            }
        }
        if (cropMode) {
            if (dir) {
                setCropDrag({ dir, startX: x, startY: y, initialCrop: { ...crop } });
                return;
            }
            const isInside = x >= Math.min(crop.x, crop.x + crop.w) && x <= Math.max(crop.x, crop.x + crop.w) &&
                y >= Math.min(crop.y, crop.y + crop.h) && y <= Math.max(crop.y, crop.y + crop.h);
            if (isInside && crop.w !== 0 && crop.h !== 0) {
                setCropDrag({ dir: 'move', startX: x, startY: y, initialCrop: { ...crop } });
                return;
            }
            setCropDrag({ startX: x, startY: y }); setCrop({ x, y, w: 0, h: 0 }); return;
        }
        if (drawMode) {
            setIsDrawing(true);
            setCurrentPath({ pts: [{ x, y }], color: brushColor, size: brushSize, opacity: brushOpacity });
            return;
        }
        if (!drawMode && !cropMode) {
            const clickedTxt = [...texts].reverse().find(t => {
                const bb = getTextBB(t);
                return x >= bb.x - 10 && x <= bb.x + bb.w + 10 && y >= bb.y - 10 && y <= bb.y + bb.h + 10;
            });
            if (clickedTxt) {
                setSelTxt(clickedTxt.id);
                setTxtDrag({ id: clickedTxt.id, startX: x, startY: y, initialX: clickedTxt.x, initialY: clickedTxt.y });
                setTextMode(true);
                return;
            } else { setSelTxt(null); }
        }
        if (!drawMode && !cropMode && !cutMode) {
            const clickedCut = [...cuts].reverse().find(c => {
                return x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h;
            });
            if (clickedCut) {
                setSelCut(clickedCut.id);
                setCutDrag({ id: clickedCut.id, startX: x, startY: y, initialX: clickedCut.x, initialY: clickedCut.y });
                return;
            } else { setSelCut(null); }
        }
        if (cutMode) {
            const isInside = x >= Math.min(cut.x, cut.x + cut.w) && x <= Math.max(cut.x, cut.x + cut.w) &&
                y >= Math.min(cut.y, cut.y + cut.h) && y <= Math.max(cut.y, cut.y + cut.h);

            if (isInside && cut.w !== 0 && cut.h !== 0) {
                // Paint-style "Lift" content
                const nx = cut.w > 0 ? cut.x : cut.x + cut.w, ny = cut.h > 0 ? cut.y : cut.y + cut.h;
                const nw = Math.abs(cut.w), nh = Math.abs(cut.h);

                const tempCanvas = document.createElement('canvas'); tempCanvas.width = nw; tempCanvas.height = nh;
                const tctx = tempCanvas.getContext('2d'); tctx.drawImage(canvasRef.current, nx, ny, nw, nh, 0, 0, nw, nh);

                const cutImg = new Image();
                cutImg.onload = () => {
                    const newId = Date.now().toString();
                    const newCut = { id: newId, img: cutImg, x: nx, y: ny, w: nw, h: nh };
                    const newCuts = [...cuts, newCut];
                    const newHoles = [...holes, { x: nx, y: ny, w: nw, h: nh }];

                    setCuts(newCuts);
                    setHoles(newHoles);
                    setSelCut(newId);
                    setCutDrag({ id: newId, startX: x, startY: y, initialX: nx, initialY: ny, isInitialLift: true });
                    pushHistory('Select & Move', { cuts: newCuts, holes: newHoles });
                };
                cutImg.src = tempCanvas.toDataURL();
                return;
            }
            setCutDrag({ startX: x, startY: y }); setCut({ x, y, w: 0, h: 0 }); return;
        }
    };

    const handleMouseMove = (e) => {
        const { x, y } = canvasXY(e);
        if (rotDrag) {
            const t = texts.find(tx => tx.id === rotDrag.id);
            if (t) {
                const bb = getTextBB(t);
                const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
                const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
                setTexts(prev => prev.map(tx => tx.id === rotDrag.id ? { ...tx, rotation: Math.round(angle + 90) } : tx));
            }
            return;
        }
        if (resizeDrag) {
            const dx = x - resizeDrag.startX, dy = y - resizeDrag.startY;
            setTexts(prev => prev.map(t => {
                if (t.id !== resizeDrag.id) return t;
                const ns = { ...t.style };
                if (resizeDrag.dir.length === 2) { // Corner -> Scale font size
                    const factor = 1 + (resizeDrag.dir.includes('e') ? dx : -dx) / 100;
                    ns.size = Math.max(8, Math.round(resizeDrag.initialSize * factor));
                } else { // Side -> Adjust wrapW
                    const sideFactor = resizeDrag.dir === 'e' ? 1 : resizeDrag.dir === 'w' ? -1 : 0;
                    const initialW = resizeDrag.initialWrapW > 0 ? resizeDrag.initialWrapW : getTextBB(t).w;

                    let deltaW = dx * sideFactor;
                    if (t.style.align === 'center') deltaW *= 2; // Symmetric growth for center alignment

                    ns.wrapW = Math.max(50, initialW + deltaW);
                }
                return { ...t, style: ns };
            }));
            return;
        }
        if (cropDrag) {
            const dx = x - cropDrag.startX, dy = y - cropDrag.startY;
            if (cropDrag.dir === 'move') {
                setCrop({ ...cropDrag.initialCrop, x: cropDrag.initialCrop.x + dx, y: cropDrag.initialCrop.y + dy });
            } else if (cropDrag.dir) {
                setCrop(prev => {
                    let { x: cx, y: cy, w: cw, h: ch } = cropDrag.initialCrop;
                    if (cropDrag.dir.includes('e')) cw += dx;
                    if (cropDrag.dir.includes('w')) { cx += dx; cw -= dx; }
                    if (cropDrag.dir.includes('s')) ch += dy;
                    if (cropDrag.dir.includes('n')) { cy += dy; ch -= dy; }
                    return { x: cx, y: cy, w: cw, h: ch };
                });
            } else {
                setCrop(prev => ({ ...prev, w: x - cropDrag.startX, h: y - cropDrag.startY }));
            }
            return;
        }
        if (isDrawing && currentPath) {
            const newPath = { ...currentPath, pts: [...currentPath.pts, { x, y }] };
            setCurrentPath(newPath);
            if (ctx.current) {
                ctx.current.save();
                ctx.current.lineJoin = 'round'; ctx.current.lineCap = 'round';
                ctx.current.strokeStyle = newPath.color; ctx.current.lineWidth = newPath.size;
                ctx.current.globalAlpha = newPath.opacity;
                ctx.current.beginPath();
                ctx.current.moveTo(newPath.pts[newPath.pts.length - 2].x, newPath.pts[newPath.pts.length - 2].y);
                ctx.current.lineTo(x, y); ctx.current.stroke(); ctx.current.restore();
            }
            return;
        }
        if (txtDrag) {
            const dx = x - txtDrag.startX, dy = y - txtDrag.startY;
            setTexts(prev => prev.map(t => t.id === txtDrag.id ? { ...t, x: txtDrag.initialX + dx, y: txtDrag.initialY + dy } : t));
        }
        if (cutDrag && !cutMode) {
            const dx = x - cutDrag.startX, dy = y - cutDrag.startY;
            setCuts(prev => prev.map(c => c.id === cutDrag.id ? { ...c, x: cutDrag.initialX + dx, y: cutDrag.initialY + dy } : c));
        }
        if (cutDrag && cutMode) {
            if (cutDrag.id) { // Dragging a lifted cut
                const dx = x - cutDrag.startX, dy = y - cutDrag.startY;
                const nx = cutDrag.initialX + dx, ny = cutDrag.initialY + dy;
                setCuts(prev => prev.map(c => c.id === cutDrag.id ? { ...c, x: nx, y: ny } : c));
                setCut(prev => ({ ...prev, x: nx, y: ny }));
            } else { // Drawing a new selection
                setCut(prev => ({ ...prev, w: x - cutDrag.startX, h: y - cutDrag.startY }));
            }
        }
    };

    const handleMouseUp = () => {
        if (isDrawing && currentPath) {
            const newDrawings = [...drawings, currentPath];
            setDrawings(newDrawings);
            setIsDrawing(false);
            setCurrentPath(null);
            pushHistory('Draw', { drawings: newDrawings });
        }
        if (txtDrag) pushHistory('Move Text', { texts });
        if (resizeDrag) pushHistory('Resize Text', { texts });
        if (rotDrag) pushHistory('Rotate Text', { texts });
        if (cutDrag && !cutMode) pushHistory('Move Cut', { cuts });
        setTxtDrag(null); setCropDrag(null); setResizeDrag(null); setRotDrag(null); setCutDrag(null);
    };

    const handleApplyCut = useCallback(() => {
        if (!canvasRef.current || cut.w === 0 || cut.h === 0) return;
        const nx = cut.w > 0 ? cut.x : cut.x + cut.w, ny = cut.h > 0 ? cut.y : cut.y + cut.h;
        const nw = Math.abs(cut.w), nh = Math.abs(cut.h);

        const tempCanvas = document.createElement('canvas'); tempCanvas.width = nw; tempCanvas.height = nh;
        const tctx = tempCanvas.getContext('2d'); tctx.drawImage(canvasRef.current, nx, ny, nw, nh, 0, 0, nw, nh);

        const cutImg = new Image();
        cutImg.onload = () => {
            const newCut = { id: Date.now().toString(), img: cutImg, x: nx, y: ny, w: nw, h: nh };
            const newCuts = [...cuts, newCut];
            const newHoles = [...holes, { x: nx, y: ny, w: nw, h: nh }];
            setCuts(newCuts);
            setHoles(newHoles);
            setCut({ x: 0, y: 0, w: 0, h: 0 }); setCutMode(false);
            pushHistory('Cut Image', { cuts: newCuts, holes: newHoles });
        };
        cutImg.src = tempCanvas.toDataURL();
    }, [cut, cuts, holes, pushHistory]);

    const handleKeyCut = useCallback(() => {
        if (!canvasRef.current || !cutMode || cut.w === 0 || cut.h === 0) return;
        const nx = cut.w > 0 ? cut.x : cut.x + cut.w, ny = cut.h > 0 ? cut.y : cut.y + cut.h;
        const nw = Math.abs(cut.w), nh = Math.abs(cut.h);

        const tempCanvas = document.createElement('canvas'); tempCanvas.width = nw; tempCanvas.height = nh;
        const tctx = tempCanvas.getContext('2d'); tctx.drawImage(canvasRef.current, nx, ny, nw, nh, 0, 0, nw, nh);

        const cutImg = new Image();
        cutImg.onload = () => {
            const newHoles = [...holes, { x: nx, y: ny, w: nw, h: nh }];
            setClipboard({ img: cutImg, w: nw, h: nh });
            setHoles(newHoles);
            setCut({ x: 0, y: 0, w: 0, h: 0 }); setCutMode(false);
            pushHistory('Cut (Ctrl+X)', { holes: newHoles });
        };
        cutImg.src = tempCanvas.toDataURL();
    }, [cut, cutMode, holes, pushHistory]);

    const handleKeyPaste = useCallback(() => {
        if (!clipboard) return;
        const newCut = { id: Date.now().toString(), img: clipboard.img, x: 50, y: 50, w: clipboard.w, h: clipboard.h };
        const newCuts = [...cuts, newCut];
        setCuts(newCuts);
        setSelCut(newCut.id);
        pushHistory('Paste (Ctrl+V)', { cuts: newCuts });
    }, [clipboard, cuts, pushHistory]);

    const handleApplyCrop = useCallback(() => {
        if (!canvasRef.current || crop.w === 0 || crop.h === 0) return;
        const nx = crop.w > 0 ? crop.x : crop.x + crop.w, ny = crop.h > 0 ? crop.y : crop.y + crop.h;
        const nw = Math.abs(crop.w), nh = Math.abs(crop.h);
        const tempCanvas = document.createElement('canvas'); tempCanvas.width = nw; tempCanvas.height = nh;
        const tctx = tempCanvas.getContext('2d'); tctx.drawImage(canvasRef.current, nx, ny, nw, nh, 0, 0, nw, nh);
        const newImg = new Image();
        newImg.onload = () => {
            const nextOrig = newImg;
            // Keep current adjustment values for display but mark as cropped so they won't be applied
            const currentAdj = { ...adj };
            const currentFx = activeFx;

            setOrigImg(nextOrig); setDrawings([]); setTexts([]);
            setCrop({ x: 0, y: 0, w: 0, h: 0 }); setCropMode(false);
            setIsCropped(true); // Mark as cropped - adjustments won't be applied but values remain visible
            setRotation(0); setFlipH(false); setFlipV(false);

            // Let the useEffect handle rendering with cropped flag

            // Immediate history push with current adjustment values
            pushHistory('Crop', {
                origImg: nextOrig, drawings: [], texts: [],
                rotation: 0, flipH: false, flipV: false,
                adj: currentAdj, activeFx: currentFx
            });
        };
        newImg.src = tempCanvas.toDataURL();
    }, [crop, adj, activeFx, pushHistory]);

    const syncEditor = useCallback((t) => {
        if (!txtEditorRef.current || !canvasRef.current) return;
        const editor = txtEditorRef.current;
        const r = canvasRef.current.getBoundingClientRect();
        const scale = r.width / canvasRef.current.width;
        const s = t.style;
        const baselineShift = s.size * 0.7;
        const padY = 2; // Matching tighter CSS padding

        editor.innerText = t.text;
        editor.style.left = `${t.x * scale}px`;
        editor.style.top = `${(t.y - baselineShift) * scale - padY}px`;
        editor.style.fontSize = `${s.size * scale}px`;
        editor.style.fontFamily = s.font;
        editor.style.fontWeight = s.bold ? 'bold' : 'normal';
        editor.style.fontStyle = s.italic ? 'italic' : 'normal';
        editor.style.textAlign = s.align;
        editor.style.letterSpacing = `${s.letterSpacing * scale}px`;
        editor.style.lineHeight = s.lineH;
        editor.style.whiteSpace = s.wrapW > 0 ? 'pre-wrap' : 'pre';
        editor.style.width = s.wrapW > 0 ? `${s.wrapW * scale}px` : 'auto';
        editor.style.transform = `rotate(${t.rotation}deg) ${s.align === 'center' ? 'translateX(-50%)' : s.align === 'right' ? 'translateX(-100%)' : ''}`;
        editor.style.color = 'transparent';
        editor.style.caretColor = s.color;

        setTimeout(() => {
            editor.focus();
            const range = document.createRange(), sel = window.getSelection();
            range.selectNodeContents(editor);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }, 0);
    }, []);

    const handleAddText = () => {
        const nextIdVal = nextId;
        const newText = { id: nextIdVal, text: 'New Text', x: canvasRef.current.width / 2, y: canvasRef.current.height / 2, rotation: 0, style: defStyle() };
        const updatedTexts = [...texts, newText];
        setTexts(updatedTexts);
        setSelTxt(newText.id);
        setEditTxt(newText.id);
        setNextId(nextId + 1);
        setTextMode(true);
        pushHistory('Add Text', { texts: updatedTexts });
        setTimeout(() => syncEditor(newText), 50);
    };

    const handleTextDblClick = (e) => {
        const { x, y } = canvasXY(e);
        const clickedTxt = [...texts].reverse().find(t => {
            const bb = getTextBB(t);
            return x >= bb.x && x <= bb.x + bb.w && y >= bb.y && y <= bb.y + bb.h;
        });
        if (clickedTxt) {
            setEditTxt(clickedTxt.id);
            syncEditor(clickedTxt);
        }
    };

    const handleRotate = useCallback(() => {
        if (!origImg) return;
        const nr = (rotation + 90) % 360;
        setRotation(nr);
        pushHistory('Rotate', { rotation: nr });
    }, [origImg, pushHistory, rotation]);

    const handleFlipH = useCallback(() => {
        if (!origImg) return;
        const nf = !flipH;
        setFlipH(nf);
        pushHistory('Flip H', { flipH: nf });
    }, [origImg, pushHistory, flipH]);

    const handleFlipV = useCallback(() => {
        if (!origImg) return;
        const nf = !flipV;
        setFlipV(nf);
        pushHistory('Flip V', { flipV: nf });
    }, [origImg, pushHistory, flipV]);

    const applyProcessedImage = useCallback((url, label) => {
        const newImg = new Image();
        newImg.onload = () => {
            const nextOrig = newImg;
            setOrigImg(nextOrig);
            setDrawings([]); setTexts([]); setRotation(0); setFlipH(false); setFlipV(false);
            setAdj({ br: 0, co: 0, sa: 0, sh: 0 }); setActiveFx(null);
            setCuts([]); setHoles([]); setCrop({ x: 0, y: 0, w: 0, h: 0 }); setCut({ x: 0, y: 0, w: 0, h: 0 });
            setCropMode(false); setCutMode(false);

            if (canvasRef.current && nextOrig) {
                drawImageToCanvas(nextOrig, 0);
            }

            pushHistory(label, {
                origImg: nextOrig, drawings: [], texts: [], rotation: 0, flipH: false, flipV: false,
                adj: { br: 0, co: 0, sa: 0, sh: 0 }, activeFx: null, cuts: [], holes: []
            });
        };
        newImg.src = url;
    }, [drawImageToCanvas, pushHistory]);

    const handleFileFunc = useCallback((file) => { if (file?.type?.startsWith('image/')) loadFile(file); }, [loadFile]);

    const handleApplyFilter = useCallback((fxId) => {
        if (!origImg) return;
        const nextFx = activeFx === fxId ? null : fxId;
        setActiveFx(nextFx);
        pushHistory(nextFx ? `Filter: ${nextFx}` : 'Clear Filter', { activeFx: nextFx });
    }, [origImg, activeFx, pushHistory]);

    useEffect(() => { if (origImg) processBaseImage(); }, [origImg, rotation, flipH, flipV, adj, activeFx, processBaseImage]);
    useEffect(() => { if (origImg && baseCanvasRef.current) renderAll(); }, [origImg, drawings, texts, renderAll]);
    useEffect(() => { if (origImg) fitCanvas(); }, [rotation, fitCanvas, origImg]);
    useEffect(() => { if (canvasRef.current) ctx.current = canvasRef.current.getContext('2d', { willReadFrequently: true }); }, []);

    // Complete reset when modal closes
    useEffect(() => {
        if (!open) {
            // Reset all refs
            loadedSrcRef.current = null;
            hIdxRef.current = -1;
            
            // Clear canvas refs
            if (canvasRef.current) {
                canvasRef.current.width = 0;
                canvasRef.current.height = 0;
            }
            if (ctx.current && canvasRef.current) {
                ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
            baseCanvasRef.current = null;
            ctx.current = null;
            
            // Reset all state to initial values
            setCurrentImage('');
            setIsImageReady(false);
            setIsLoading(false);
            setTab('ctrl');
            setDrawMode(false);
            setTextMode(false);
            setCropMode(false);
            setAdj({ br: 0, co: 0, sa: 0, sh: 0 });
            setActiveFx(null);
            setBrushColor('#ffffff');
            setBrushSize(12);
            setBrushOpacity(1);
            setIsCropped(false);
            setRotation(0);
            setFlipH(false);
            setFlipV(false);
            setCrop({ x: 0, y: 0, w: 0, h: 0 });
            setTexts([]);
            setSelTxt(null);
            setEditTxt(null);
            setHistory([]);
            setHistIdx(-1);
            setOrigImg(null);
            setDrawings([]);
            setCurrentPath(null);
            setIsDrawing(false);
            setCropDrag(null);
            setTxtDrag(null);
            setResizeDrag(null);
            setRotDrag(null);
            setNextId(1);
            setCutMode(false);
            setCut({ x: 0, y: 0, w: 0, h: 0 });
            setCuts([]);
            setSelCut(null);
            setCutDrag(null);
            setHoles([]);
            setClipboard(null);
        }
    }, [open]);

    // Sync currentImage with initialImage prop changes
    useEffect(() => {
        if (open && initialImage) {
            setCurrentImage(initialImage);
        }
    }, [initialImage, open]);

    useEffect(() => {
        if (open && currentImage && loadedSrcRef.current !== currentImage) {
            setIsLoading(true);
            setIsImageReady(false);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                loadedSrcRef.current = currentImage;
                setOrigImg(img); setRotation(0); setFlipH(false); setFlipV(false);
                setAdj({ br: 0, co: 0, sa: 0, sh: 0 }); setActiveFx(null);
                setDrawings([]); setTexts([]); setSelTxt(null); setEditTxt(null);

                const initialHistory = {
                    label: 'Image Loaded', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    drawings: [], texts: [], adj: { br: 0, co: 0, sa: 0, sh: 0 }, rotation: 0, flipH: false, flipV: false, activeFx: null, origImg: img, isImageReady: true
                };
                setHistory([initialHistory]);
                setHistIdx(0);
                hIdxRef.current = 0;

                // Use a direct call for initial render instead of relying on drawImageToCanvas in deps
                setTimeout(() => {
                    if (img) drawImageToCanvas(img, 0);
                    setIsImageReady(true);
                    setIsLoading(false);
                }, 80);
            };
            img.onerror = () => {
                console.error('Failed to load image');
                setIsLoading(false);
            };
            img.src = currentImage;
        }
    }, [open, currentImage]); // Removed drawImageToCanvas to avoid re-init cycles
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') { e.preventDefault(); undo(); }
                else if (e.key === 'y' || (e.key === 'Z' && e.shiftKey)) { e.preventDefault(); redo(); }
                else if (e.key === 'x') { e.preventDefault(); handleKeyCut(); }
                else if (e.key === 'v' && isImageReady) { e.preventDefault(); handleKeyPaste(); }
            }
            if (e.key === 'Enter') {
                if (cropMode && crop.w !== 0 && crop.h !== 0) { e.preventDefault(); handleApplyCrop(); }
                else if (cutMode && cut.w !== 0 && cut.h !== 0) { e.preventDefault(); handleApplyCut(); }
            }
            if (e.key === 'Escape' && (cropMode || cutMode)) {
                setCropMode(false);
                setCutMode(false);
                setCrop({ x: 0, y: 0, w: 0, h: 0 });
                setCut({ x: 0, y: 0, w: 0, h: 0 });
            }
        };

        const handlePasteRaw = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    loadFile(blob);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        if (!isImageReady) window.addEventListener('paste', handlePasteRaw);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('paste', handlePasteRaw);
        };
    }, [undo, redo, cropMode, crop, cutMode, cut, handleApplyCrop, handleApplyCut, handleKeyCut, handleKeyPaste, isImageReady, loadFile]);

    return {
        canvasRef, txtEditorRef, cwRef, currentImage, isImageReady, isLoading, tab, setTab, drawMode, setDrawMode, textMode, setTextMode, cropMode, setCropMode,
        adj, setAdj, activeFx, setActiveFx, brushColor, setBrushColor, brushSize, setBrushSize, brushOpacity, setBrushOpacity,
        rotation, setRotation, flipH, setFlipH, flipV, setFlipV,
        crop, setCrop, texts, setTexts, selTxt, setSelTxt, editTxt, setEditTxt, history, setHistory, histIdx, setHistIdx, drawings, setDrawings,
        cutMode, setCutMode, cut, setCut, cuts, setCuts, selCut, setSelCut, isCropped, setIsCropped,
        handleMouseDown, handleMouseMove, handleMouseUp, handleApplyCrop, handleApplyCut, handleAddText, handleTextDblClick, handleRotate, handleFlipH, handleFlipV, handleFileFunc,
        handleApplyFilter, undo, redo, pushHistory, fitCanvas, getTextBB, removeImage, applyProcessedImage
    };
};

"use client"
import React from 'react';
import {
    Box,
    Button,
    IconButton,
    Typography,
    Slider,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import {
    ArrowLeft,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Type,
    Paintbrush,
    Check,
} from 'lucide-react';

export const SectionHead = ({ label }) => (
    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#6d6b77', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
    </Typography>
);

export const SliderRow = ({ label, value, unit = 'px', min, max, step = 1, k, update, pushHistory }) => (
    <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#2f2b3d', flex: 1 }}>{label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#7367f0', mr: 0.3 }}>{value}</Typography>
            <Typography sx={{ fontSize: 11, color: '#6d6b77' }}>{unit}</Typography>
        </Box>
        <Slider
            value={value}
            onChange={(_, v) => update(k, v)}
            onChangeCommitted={() => pushHistory(label)}
            min={min}
            max={max}
            step={step}
            size="small"
            sx={{
                py: 1,
                '& .MuiSlider-thumb': { width: 14, height: 14, backgroundColor: '#7367f0', boxShadow: '0 0 0 4px rgba(115,103,240,0.1)' },
                '& .MuiSlider-track': { height: 4, backgroundColor: '#7367f0' },
                '& .MuiSlider-rail': { height: 4, backgroundColor: 'rgba(47, 43, 61, 0.1)' },
            }}
        />
    </Box>
);

export const TextProperties = ({ selected, onUpdate, onDone, pushHistory }) => {
    if (!selected) return null;
    const s = selected.style;
    const update = (k, v) => onUpdate({ ...selected, style: { ...s, [k]: v } });

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#fff', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(47, 43, 61, 0.1)', borderRadius: 10 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={onDone} size="small" sx={{ color: '#6d6b77', p: 0.5, ml: -0.5, '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)' } }}>
                        <ArrowLeft size={18} />
                    </IconButton>
                    <Type size={18} color="#7367f0" />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2f2b3d' }}>Text Properties</Typography>
                </Box>
                <Button
                    onClick={onDone}
                    size="small"
                    variant="contained"
                    startIcon={<Check size={14} />}
                    sx={{ height: 28, fontSize: 11.5, px: 2, backgroundColor: 'rgba(115,103,240,0.08)', color: '#7367f0', borderRadius: '6px', border: '1px solid rgba(115,103,240,0.2)', boxShadow: 'none', textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: 'rgba(115,103,240,0.15)', boxShadow: 'none' } }}
                >
                    Done
                </Button>
            </Box>

            <SectionHead label="Font Family" />
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <Select
                    value={s.font}
                    onChange={(e) => { update('font', e.target.value); pushHistory('Font Family'); }}
                    sx={{
                        height: 40, borderRadius: '8px', backgroundColor: '#f8f7fa', color: '#2f2b3d', fontSize: 13,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(47, 43, 61, 0.12)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7367f0' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid #7367f0' }
                    }}
                >
                    {['DM Sans', 'Roboto', 'Inter', 'Outfit', 'Georgia', 'Arial'].map(f => <MenuItem key={f} value={f} sx={{ fontSize: 13 }}>{f}</MenuItem>)}
                </Select>
            </FormControl>

            <SectionHead label="Size & Spacing" />
            <SliderRow label="Font Size" value={s.size} min={8} max={200} k="size" update={update} pushHistory={pushHistory} />
            <SliderRow label="Letter Spacing" value={s.letterSpacing} min={-5} max={50} k="letterSpacing" unit="" update={update} pushHistory={pushHistory} />
            <SliderRow label="Line Height" value={s.lineH} min={0.8} max={3} step={0.1} k="lineH" unit="" update={update} pushHistory={pushHistory} />

            <SectionHead label="Style" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {[
                    { k: 'bold', icon: <Bold size={20} /> },
                    { k: 'italic', icon: <Italic size={20} /> },
                    { k: 'underline', icon: <Underline size={20} /> },
                    { k: 'strike', icon: <Strikethrough size={20} /> },
                    { k: 'upper', icon: <Type size={26} /> },
                ].map(it => (
                    <IconButton
                        key={it.k}
                        onClick={() => { update(it.k, !s[it.k]); pushHistory(`Style: ${it.k}`); }}
                        sx={{
                            width: 42, height: 40, borderRadius: '8px',
                            backgroundColor: s[it.k] ? '#7367f0' : '#f8f7fa',
                            color: s[it.k] ? '#fff' : '#6d6b77',
                            border: '1px solid', borderColor: s[it.k] ? '#7367f0' : 'rgba(47, 43, 61, 0.12)',
                            boxShadow: s[it.k] ? '0 2px 4px rgba(115,103,240,0.3)' : 'none',
                            '&:hover': { backgroundColor: s[it.k] ? '#6459d8' : 'rgba(115,103,240,0.08)' }
                        }}
                    >
                        {it.icon}
                    </IconButton>
                ))}
            </Box>

            <SectionHead label="Alignment" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {[
                    { v: 'left', icon: <AlignLeft size={18} /> },
                    { v: 'center', icon: <AlignCenter size={18} /> },
                    { v: 'right', icon: <AlignRight size={18} /> },
                ].map(it => (
                    <IconButton
                        key={it.v}
                        onClick={() => { update('align', it.v); pushHistory(`Align: ${it.v}`); }}
                        sx={{
                            flex: 1, height: 40, borderRadius: '8px',
                            backgroundColor: s.align === it.v ? '#7367f0' : '#f8f7fa',
                            color: s.align === it.v ? '#fff' : '#6d6b77',
                            border: '1px solid', borderColor: s.align === it.v ? '#7367f0' : 'rgba(47, 43, 61, 0.12)',
                            boxShadow: s.align === it.v ? '0 2px 4px rgba(115,103,240,0.3)' : 'none',
                            '&:hover': { backgroundColor: s.align === it.v ? '#6459d8' : 'rgba(115,103,240,0.08)' }
                        }}
                    >
                        {it.icon}
                    </IconButton>
                ))}
            </Box>

            <SectionHead label="Text Color" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#f8f7fa', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77', minWidth: 40 }}>Fill</Typography>
                    <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.color, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        <input type="color" value={s.color} onChange={(e) => update('color', e.target.value)} onBlur={() => pushHistory('Text Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{s.color.toUpperCase()}</Typography>
                </Box>
            </Box>

            <SectionHead label="Stroke (Outline)" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#f8f7fa', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)', mb: 1.5 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77', minWidth: 40 }}>Color</Typography>
                    <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.strokeColor, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        <input type="color" value={s.strokeColor} onChange={(e) => update('strokeColor', e.target.value)} onBlur={() => pushHistory('Stroke Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{s.strokeColor.toUpperCase()}</Typography>
                </Box>
                <SliderRow label="Stroke Width" value={s.strokeW} min={0} max={20} k="strokeW" unit="" update={update} pushHistory={pushHistory} />
            </Box>

            <SectionHead label="Shadow" />
            <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#f8f7fa', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)', mb: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77', minWidth: 40 }}>Color</Typography>
                    <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.shadowColor, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        <input type="color" value={s.shadowColor} onChange={(e) => update('shadowColor', e.target.value)} onBlur={() => pushHistory('Shadow Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{s.shadowColor.toUpperCase()}</Typography>
                </Box>
                <SliderRow label="Blur" value={s.shadowBlur} min={0} max={50} k="shadowBlur" unit="" update={update} pushHistory={pushHistory} />
                <SliderRow label="Offset X" value={s.shadowX} min={-50} max={50} k="shadowX" unit="" update={update} pushHistory={pushHistory} />
                <SliderRow label="Offset Y" value={s.shadowY} min={-50} max={50} k="shadowY" unit="" update={update} pushHistory={pushHistory} />
            </Box>
        </Box>
    );
};

export const BrushProperties = ({ color, size, opacity, onUpdate, onDone, pushHistory }) => {
    return (
        <Box sx={{ flex: 1, overflowY: 'hidden', p: 2, backgroundColor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={onDone} size="small" sx={{ color: '#6d6b77', p: 0.5, ml: -0.5, '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)' } }}>
                        <ArrowLeft size={18} />
                    </IconButton>
                    <Paintbrush size={18} color="#7367f0" />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2f2b3d' }}>Brush Properties</Typography>
                </Box>
                <Button
                    onClick={onDone}
                    size="small"
                    variant="contained"
                    startIcon={<Check size={14} />}
                    sx={{ height: 28, fontSize: 11.5, px: 2, backgroundColor: 'rgba(115,103,240,0.08)', color: '#7367f0', borderRadius: '6px', border: '1px solid rgba(115,103,240,0.2)', boxShadow: 'none', textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: 'rgba(115,103,240,0.15)', boxShadow: 'none' } }}
                >
                    Done
                </Button>
            </Box>

            <SectionHead label="Size & Opacity" />
            <SliderRow label="Brush Size" value={size} min={1} max={100} k="size" update={onUpdate} pushHistory={pushHistory} />
            <SliderRow label="Opacity" value={opacity} min={0.01} max={1} step={0.01} k="opacity" unit="%" update={onUpdate} pushHistory={pushHistory} />

            <SectionHead label="Color Swatches" />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 3.5 }}>
                {['#ffffff', '#000000', '#f05353', '#f0a753', '#f0de53', '#28c76f', '#00cfe8', '#7367f0', '#ce9ffc', '#f08cce'].map(c => (
                    <Box
                        key={c}
                        onClick={() => { onUpdate('color', c); pushHistory('Brush Color'); }}
                        sx={{
                            width: 28, height: 28, borderRadius: '50%', backgroundColor: c, cursor: 'pointer',
                            border: color === c ? '2px solid #7367f0' : '1px solid rgba(47, 43, 61, 0.12)',
                            boxShadow: color === c ? '0 0 10px rgba(115,103,240,0.4)' : 'none',
                            transition: 'all 0.15s ease',
                            '&:hover': { transform: 'scale(1.15)', boxShadow: `0 3px 6px rgba(0,0,0,0.1)` }
                        }}
                    />
                ))}
            </Box>

            <SectionHead label="Custom Color" />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#f8f7fa', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)' }}>
                <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: color, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <input type="color" value={color} onChange={(e) => onUpdate('color', e.target.value)} onBlur={() => pushHistory('Brush Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{color.toUpperCase()}</Typography>
            </Box>
        </Box>
    );
};

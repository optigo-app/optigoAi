export const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

export const defStyle = () => ({
    font: 'DM Sans',
    size: 32,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    upper: false,
    align: 'left',
    color: '#000000',
    strokeColor: '#000000',
    strokeW: 0,
    shadowColor: '#000000',
    shadowBlur: 0,
    shadowX: 0,
    shadowY: 0,
    letterSpacing: 0,
    lineH: 1.2,
    opacity: 1,
    wrapW: 0,
});

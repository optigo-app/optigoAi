import { Box, Button } from "@mui/material";
import {ShoppingBag, Sparkles } from "lucide-react";

export const ModeSwitch = ({ selectedMode, onSelect }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 0.5,
                p: 0.5,
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 8px 32px rgba(31, 38, 135, 0.07)",
                mb: 4
            }}
        >
            {['design', 'stock'].map((mode) => {
                const isSelected = selectedMode === mode;
                return (
                    <Button
                        key={mode}
                        onClick={() => onSelect(mode)}
                        startIcon={mode === 'design' ? <Sparkles size={16} /> : <ShoppingBag size={16} />}
                        disableRipple
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: "12px",
                            textTransform: "none",
                            fontSize: "1rem",
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? "white" : "text.secondary",
                            background: isSelected ? "linear-gradient(135deg, #7367f0 0%, #5e50ee 100%)" : "transparent",
                            boxShadow: isSelected ? "0 4px 15px rgba(115, 103, 240, 0.35)" : "none",
                            '&:hover': {
                                background: isSelected ? "linear-gradient(135deg, #7367f0 0%, #5e50ee 100%)" : "rgba(255,255,255,0.5)"
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                    >
                        {mode === 'design' ? "Design Collection" : "Stock Purchase"}
                    </Button>
                );
            })}
        </Box>
    );
};

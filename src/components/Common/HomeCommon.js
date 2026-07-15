import { Box, Button } from "@mui/material";
import { ShoppingBag, Sparkles, Palette } from "lucide-react";
import { motion } from "framer-motion";

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
                            transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
                        }}
                    >
                        {mode === 'design' ? "Search by Design" : "Search by Stock"}
                    </Button>
                );
            })}
        </Box>
    );
};

export const SearchModeToggle = ({ activeMode, onModeChange, onMaintenanceClick, onSubscriptionClick, onTrainingClick, isConfigEnabled, sx = {} }) => {
    const handleModeClick = (modeId) => {
        // If switching to AI mode, check config flags
        if (modeId === 'ai') {
            // Check IsAiEnable (when enabled, show subscription modal)
            if (isConfigEnabled && isConfigEnabled('IsAiEnable')) {
                if (onSubscriptionClick) onSubscriptionClick();
                return;
            }

            // Check IsAiMaintenance first
            if (isConfigEnabled && isConfigEnabled('IsAiMaintenance')) {
                if (onMaintenanceClick) onMaintenanceClick();
                return;
            }
            // Check IsAiReady (when enabled, show training modal)
            if (isConfigEnabled && isConfigEnabled('IsAiReady')) {
                if (onTrainingClick) onTrainingClick();
                return;
            }

        }

        // If all checks pass or it's design mode, change mode
        onModeChange(modeId);
    };

    // Check if any AI flag is active
    const hasAiIssue = isConfigEnabled && (
        isConfigEnabled('IsAiMaintenance') ||
        isConfigEnabled('IsAiEnable') ||
        isConfigEnabled('IsAiReady')
    );

    return (
        <Box
            sx={{
                display: "flex",
                gap: 1.5,
                mb: 3,
                width: "100%",
                justifyContent: "center",
                ...sx
            }}
        >
            {[
                { id: "design", label: "Your Design", icon: <Palette size={16} />, color: "#7367f0" },
                { id: "ai", label: "AI Search", icon: <Sparkles size={16} />, color: "#7367f0" },
            ].map((mode) => {
                const isActive = activeMode === mode.id;
                const isAiMode = mode.id === "ai";
                const showIssueBadge = isAiMode && hasAiIssue;

                return (
                    <motion.div
                        key={mode.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ position: 'relative' }}
                    >
                        {/* Issue Badge for AI mode */}
                        {showIssueBadge && (
                            <Box
                                component={motion.div}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                                    border: '2px solid white',
                                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                                    zIndex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: 'white',
                                }}
                            >
                                !
                            </Box>
                        )}

                        <Button
                            onClick={() => handleModeClick(mode.id)}
                            startIcon={mode.icon}
                            disableRipple
                            size="small"
                            sx={{
                                px: 2.5,
                                py: 0.75,
                                borderRadius: "20px",
                                textTransform: "none",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                minHeight: "36px",
                                position: 'relative',

                                border: `1px solid ${isActive
                                    ? mode.color
                                    : showIssueBadge
                                        ? "rgba(255,107,107,0.3)"
                                        : "rgba(0,0,0,0.12)"
                                    }`,

                                backgroundColor: isActive
                                    ? `${mode.color}1A`
                                    : showIssueBadge
                                        ? "rgba(255,107,107,0.05)"
                                        : "transparent",

                                color: isActive
                                    ? mode.color
                                    : showIssueBadge
                                        ? "rgba(255,107,107,0.7)"
                                        : "text.secondary",

                                opacity: showIssueBadge ? 0.85 : 1,
                                cursor: 'pointer',

                                transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",

                                '&:hover': {
                                    backgroundColor: isActive
                                        ? `${mode.color}26`
                                        : showIssueBadge
                                            ? "rgba(255,107,107,0.1)"
                                            : "rgba(0,0,0,0.05)",
                                    borderColor: showIssueBadge ? "rgba(255,107,107,0.5)" : mode.color,
                                    opacity: 1,
                                },

                                '& .MuiButton-startIcon': {
                                    marginRight: "6px",
                                    transform: isActive ? "scale(1.05)" : "scale(1)",
                                },
                            }}
                        >
                            {mode.label}
                        </Button>
                    </motion.div>
                );
            })}
        </Box>
    );
};

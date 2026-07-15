"use client";
import React from 'react';
import { Box, Typography, Tooltip, Skeleton } from '@mui/material';
import { Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokenUsage } from '@/context/TokenUsageContext';

const MAX_TOKENS = 100;

const TokenBadge = ({ onUpgrade }) => {
    const { remaining, maxTokens, isLoading } = useTokenUsage();
    const isLow = remaining <= 20;
    const isCritical = remaining <= 5;

    const tokenColor = isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#7367f0';

    return (
        <Tooltip
            title={`${remaining} of ${maxTokens} AI credits remaining`}
            arrow
            placement="bottom"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderRadius: 2,
                        px: 2,
                        py: 0.6,
                        bgcolor: 'rgba(115, 103, 240, 0.08)',
                        border: '1px solid',
                        borderColor: isCritical ? 'rgba(239, 68, 68, 0.2)' : isLow ? 'rgba(245, 158, 11, 0.2)' : 'rgba(115, 103, 240, 0.2)',
                        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                        '&:hover': {
                            bgcolor: 'rgba(115, 103, 240, 0.12)',
                            transform: 'translateY(-1px)',
                        },
                    }}
                >
                    {/* Credits Counter */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <motion.span
                            animate={{ rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: 'flex' }}
                        >
                            <Coins size={18} style={{ color: tokenColor }} />
                        </motion.span>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            {isLoading ? (
                                <Skeleton
                                    variant="text"
                                    width={48}
                                    height={18}
                                    sx={{ borderRadius: 1, bgcolor: 'rgba(115, 103, 240, 0.15)' }}
                                />
                            ) : (
                                <>
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        <motion.div
                                            key={remaining}
                                            initial={{ scale: 0.6, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.6, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ display: 'flex', alignItems: 'center' }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: tokenColor,
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {remaining}
                                            </Typography>
                                        </motion.div>
                                    </AnimatePresence>
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            lineHeight: 1,
                                        }}
                                    >
                                        /{maxTokens}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>
            </motion.div>
        </Tooltip>
    );
};

export default TokenBadge;

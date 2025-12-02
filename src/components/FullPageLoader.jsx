"use client";
import React from 'react';
import { Box, CircularProgress, Backdrop, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const FullPageLoader = ({ open, message = "Loading..." }) => {
    if (!open) return null;

    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.modal + 1,
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}
            open={open}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Box>
                    <Box
                        sx={{
                            position: 'relative',
                            width: 80,
                            height: 80,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <CircularProgress
                            size={60}
                            thickness={2.5}
                            disableShrink
                            sx={{
                                color: 'primary.main',
                                position: 'absolute',
                                animationDuration: '1.5s'
                            }}
                        />
                        <Box
                            component="img"
                            src="/icons/base-icon.svg"
                            alt="Loading"
                            sx={{
                                width: 40,
                                height: 40,
                                animation: 'pulse 2s infinite ease-in-out'
                            }}
                        />
                    </Box>

                    <Typography
                        variant="subtitle1"
                        color="white"
                        sx={{
                            mt: 2,
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}
                    >
                        {message}
                    </Typography>
                </Box>
            </motion.div>
        </Backdrop>
    );
};

export default FullPageLoader;
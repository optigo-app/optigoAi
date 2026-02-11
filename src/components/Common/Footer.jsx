"use client";
import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 2,
                background: 'linear-gradient(to bottom, transparent, rgba(115, 103, 240, 0.05))',
                borderTop: '1px solid rgba(0,0,0,0.05)',
                mt: 6,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth={false} sx={{ maxWidth: '100%' }}>
                <Box
                    sx={{
                        display: { xs: 'flex', md: 'grid' },
                        gridTemplateColumns: { md: '1fr auto 1fr' },
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: { xs: 1, md: 0 },
                        position: 'relative',
                        zIndex: 1,
                        minHeight: 48
                    }}
                >
                    {/* Left Section: Powered by */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <Typography
                                component={motion.p}
                                variant="body2"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    letterSpacing: 1,
                                    background: 'linear-gradient(90deg, #7367f0, #ea5455, #7367f0)',
                                    backgroundSize: '200% auto',
                                    backgroundClip: 'text',
                                    textFillColor: 'transparent',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'inline-block',
                                    cursor: 'default'
                                }}
                            // animate={{
                            //     backgroundPosition: ['0% center', '200% center']
                            // }}
                            // transition={{
                            //     duration: 3,
                            //     repeat: Infinity,
                            //     ease: "linear"
                            // }}
                            >
                                Powered by Optigo
                            </Typography>
                        </motion.div>
                    </Box>

                    {/* Center Section: Copyright */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.disabled',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Copyright © 2026 OptigoAI. All rights reserved.
                    </Typography>

                    {/* Right Section: Spacer to balance the grid for perfect centering */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }} />
                </Box>
            </Container>

            {/* Decorative background element */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-50%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: '100px',
                    background: 'radial-gradient(ellipse at center, rgba(115, 103, 240, 0.15) 0%, transparent 70%)',
                    zIndex: 0,
                    filter: 'blur(40px)',
                    opacity: 0.8
                }}
            />
        </Box>
    );
};

export default Footer;

"use client";
import React from 'react';
import { Box, Backdrop, Typography } from '@mui/material';
import RotatingLoadingText from './Common/RotatingLoadingText';

const FullPageLoader = ({ open, message = "Loading...", subtitle, rotatingType }) => {
    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.modal + 1,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                willChange: 'opacity',
                display: 'flex',
                flexDirection: 'column',
                p: 2
            }}
            open={open}
            transitionDuration={400}
        >
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: { xs: 'calc(100vw - 32px)', sm: 420 },
                        maxWidth: 420,
                        px: { xs: 3, sm: 5 },
                        py: 4,
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        boxShadow: '0 24px 70px rgba(28, 39, 60, 0.15)',
                    }}
                >
                    <Box
                        component="svg"
                        viewBox="0 0 200 200"
                        role="img"
                        aria-label="Loading"
                        sx={{
                            display: 'block',
                            width: 100,
                            height: 100,
                            mb: 2,
                            '@keyframes loaderRing': {
                                from: { strokeDasharray: '0 257 0 0 1 0 0 258' },
                                '25%': { strokeDasharray: '0 0 0 0 257 0 258 0' },
                                '50%, to': { strokeDasharray: '0 0 0 0 0 515 0 0' },
                            },
                            '@keyframes loaderBall': {
                                'from, 50%': { animationTimingFunction: 'ease-in', strokeDashoffset: 1 },
                                '64%': { animationTimingFunction: 'ease-in', strokeDashoffset: -109 },
                                '78%': { animationTimingFunction: 'ease-in', strokeDashoffset: -145 },
                                '92%': { animationTimingFunction: 'ease-in', strokeDashoffset: -157 },
                                '57%, 71%, 85%, 99%, to': { animationTimingFunction: 'ease-out', strokeDashoffset: -163 },
                            },
                            '& .loader-ring, & .loader-ball': {
                                animation: 'loaderRing 2s ease-out infinite',
                                willChange: 'stroke-dasharray, stroke-dashoffset',
                            },
                            '& .loader-ball': {
                                animationName: 'loaderBall',
                            },
                        }}
                    >
                        <defs>
                            <linearGradient id="loader-gradient-ring" x1="1" y1="0.5" x2="0" y2="0.5">
                                <stop offset="0%" stopColor="#B300C3" />
                                <stop offset="100%" stopColor="#6200B3" />
                            </linearGradient>
                            <linearGradient id="loader-gradient-ball" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#B300C3" />
                                <stop offset="100%" stopColor="#6200B3" />
                            </linearGradient>
                        </defs>
                        <circle
                            className="loader-ring"
                            cx="100"
                            cy="100"
                            r="82"
                            fill="none"
                            stroke="url(#loader-gradient-ring)"
                            strokeWidth="36"
                            strokeDasharray="0 257 1 257"
                            strokeDashoffset="0.01"
                            strokeLinecap="round"
                            transform="rotate(-90,100,100)"
                        />
                        <line
                            className="loader-ball"
                            stroke="url(#loader-gradient-ball)"
                            x1="100"
                            y1="18"
                            x2="100.01"
                            y2="182"
                            strokeWidth="36"
                            strokeDasharray="1 165"
                            strokeLinecap="round"
                        />
                        <clipPath id="loader-logo-clip">
                            <circle cx="100" cy="100" r="35" />
                        </clipPath>
                        <image href="/icons/base-icon2.svg" x="65" y="65" width="70" height="70" clipPath="url(#loader-logo-clip)" />
                    </Box>

                    {/* {message ? (
                        <Typography
                            variant="subtitle1"
                            sx={{
                                mt: 1,
                                color: '#1b2638',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                            }}
                        >
                            {message}
                        </Typography>
                    ) : null} */}
                    {rotatingType ? (
                        <Box
                            sx={{
                                width: '100%',
                                mt: 1,
                                px: 1,
                                color: '#1b2638',
                            }}
                        >
                            <RotatingLoadingText type={rotatingType} interval={3500} />
                        </Box>
                    ) : subtitle ? (
                        <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: '#536174' }}
                        >
                            {subtitle}
                        </Typography>
                    ) : null}
                </Box>
            </Box>
        </Backdrop>
    );
};

export default FullPageLoader;
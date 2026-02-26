"use client";

import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Fade,
    Backdrop,
    Chip
} from '@mui/material';
import { X, Brain, Database, Zap, CheckCircle2, Phone, Mail, Image as ImageIcon, Layers, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const AiTrainingModal = ({ open, onClose }) => {
    const features = [
        { icon: <Database size={18} />, text: 'Indexing every detail' },
        { icon: <Zap size={18} />, text: 'Lightning-fast results' },
        { icon: <CheckCircle2 size={18} />, text: 'Perfect accuracy' }
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 400 }}
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: {
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }
            }}
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    background: '#ffffff',
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                    position: 'relative',
                }
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    zIndex: 2,
                    color: 'text.secondary',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': {
                        backgroundColor: 'rgba(255,255,255,1)',
                        color: 'error.main',
                    },
                    transition: 'all 0.2s ease',
                }}
            >
                <X size={20} />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        minHeight: { xs: 'auto', md: '500px' },
                    }}
                >
                    {/* Left Side - Content */}
                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 4, md: 6 },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        {/* Title */}
                        <Typography
                            variant="h3"
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                color: '#1a1a2e',
                                fontSize: { xs: '1.75rem', md: '2rem' },
                                lineHeight: 1.2,
                            }}
                        >
                            Fine-Tuning Your Experience
                        </Typography>

                        {/* Subtitle */}
                        <Typography
                            variant="body1"
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            sx={{
                                color: 'text.secondary',
                                mb: 4,
                                lineHeight: 1.7,
                                fontSize: '0.85rem',
                            }}
                        >
                            Your personalized AI is currently learning the unique details of your inventory.
                            We are indexing every detail to ensure lightning-fast results and perfect accuracy for your searches.
                        </Typography>

                        {/* Progress Section */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(115,103,240,0.08) 0%, rgba(162,155,254,0.05) 100%)',
                                border: '2px solid rgba(115,103,240,0.2)',
                                mb: 4,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    component={motion.div}
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        border: '3px solid rgba(115,103,240,0.2)',
                                        borderTopColor: '#7367f0',
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#7367f0',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    PREPARING YOUR CATALOG...
                                </Typography>
                            </Box>
                        </Box>

                        {/* Features List */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            sx={{ mb: 4 }}
                        >
                            {features.map((feature, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mb: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '8px',
                                            background: 'rgba(115,103,240,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#7367f0',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            color: 'text.secondary',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {feature.text}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Contact Info */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.85rem',
                                    mb: 1.5,
                                    fontWeight: 600,
                                }}
                            >
                                Questions? We're here to help:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <Box
                                    component="a"
                                    href="tel:+919099887762"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateX(2px)',
                                        }
                                    }}
                                >
                                    <Phone size={14} color="#7367f0" />
                                    <Typography
                                        sx={{
                                            color: '#7367f0',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        +91 90998 87762
                                    </Typography>
                                </Box>
                                <Box
                                    component="a"
                                    href="mailto:Support@orail.in"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateX(2px)',
                                        }
                                    }}
                                >
                                    <Mail size={14} color="#7367f0" />
                                    <Typography
                                        sx={{
                                            color: '#7367f0',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        Support@orail.in
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Right Side - Image Processing Machine Animation */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        sx={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 4,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Ambient Background Glow */}
                        <Box
                            component={motion.div}
                            animate={{
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            sx={{
                                position: 'absolute',
                                width: '400px',
                                height: '400px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(115,103,240,0.15) 0%, transparent 70%)',
                                filter: 'blur(60px)',
                                willChange: 'opacity',
                            }}
                        />

                        {/* Main Container */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '400px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Central Processing Machine */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    zIndex: 3,
                                }}
                            >
                                {/* Machine Body */}
                                <Box
                                    component={motion.div}
                                    animate={{
                                        boxShadow: [
                                            '0 20px 60px rgba(115,103,240,0.3)',
                                            '0 25px 70px rgba(115,103,240,0.5)',
                                            '0 20px 60px rgba(115,103,240,0.3)',
                                        ],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    sx={{
                                        width: '140px',
                                        height: '140px',
                                        borderRadius: '24px',
                                        background: 'linear-gradient(135deg, #7367f0 0%, #9e95f5 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        border: '4px solid rgba(255,255,255,0.2)',
                                        willChange: 'box-shadow',
                                    }}
                                >
                                    {/* Rotating Gear Effect */}
                                    <Box
                                        component={motion.div}
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            border: '3px dashed rgba(255,255,255,0.3)',
                                            willChange: 'transform',
                                        }}
                                    />

                                    {/* Brain Icon */}
                                    <Brain size={60} color="#fff" strokeWidth={2} />

                                    {/* Energy Waves */}
                                    {[0, 1].map((i) => (
                                        <Box
                                            key={`wave-${i}`}
                                            component={motion.div}
                                            animate={{
                                                scale: [1, 1.6],
                                                opacity: [0.5, 0],
                                            }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                                delay: i * 1.25,
                                                ease: "easeOut"
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '24px',
                                                border: '3px solid rgba(255,255,255,0.6)',
                                                willChange: 'transform, opacity',
                                            }}
                                        />
                                    ))}
                                </Box>

                                {/* Machine Label */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: -35,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        whiteSpace: 'nowrap',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            color: '#7367f0',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        AI Processor
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Animated Images - Reduced to 3 for better performance */}
                            {[0, 1, 2].map((i) => {
                                const icons = [ImageIcon, Database, Zap];
                                const colors = ['#7367f0', '#28c76f', '#ff9f43'];
                                const Icon = icons[i];
                                const color = colors[i];

                                return (
                                    <Box
                                        key={`image-${i}`}
                                        component={motion.div}
                                        animate={{
                                            y: [350, 0, -350],
                                            scale: [0.7, 1, 0.7],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity,
                                            delay: i * 1.67,
                                            ease: "easeInOut",
                                            times: [0, 0.5, 1]
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            width: 70,
                                            height: 70,
                                            borderRadius: '16px',
                                            background: '#fff',
                                            boxShadow: `0 8px 32px ${color}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `3px solid ${color}`,
                                            zIndex: 2,
                                            willChange: 'transform, opacity',
                                        }}
                                    >
                                        <Icon size={32} color={color} strokeWidth={2} />
                                    </Box>
                                );
                            })}

                            {/* Conveyor Belt Line */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: '2px',
                                    height: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(180deg, transparent 0%, rgba(115,103,240,0.2) 20%, rgba(115,103,240,0.2) 80%, transparent 100%)',
                                    zIndex: 1,
                                }}
                            >
                                {/* Moving Dots - Reduced to 3 */}
                                {[0, 1, 2].map((i) => (
                                    <Box
                                        key={`conveyor-dot-${i}`}
                                        component={motion.div}
                                        animate={{
                                            y: ['100%', '-100%'],
                                            opacity: [0, 1, 1, 0],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: i * 1,
                                            ease: "linear",
                                            times: [0, 0.1, 0.9, 1]
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: '#7367f0',
                                            boxShadow: '0 0 10px #7367f0',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            willChange: 'transform, opacity',
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Input Arrow */}
                            <Box
                                component={motion.div}
                                animate={{
                                    y: [0, 8, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                sx={{
                                    position: 'absolute',
                                    bottom: 30,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    willChange: 'transform',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        color: '#7367f0',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Input
                                </Typography>
                                <Box
                                    sx={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        borderBottom: '12px solid #7367f0',
                                    }}
                                />
                            </Box>

                            {/* Output Arrow */}
                            <Box
                                component={motion.div}
                                animate={{
                                    y: [0, -8, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.75
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: 30,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    willChange: 'transform',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        borderTop: '12px solid #28c76f',
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        color: '#28c76f',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Processed
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AiTrainingModal;

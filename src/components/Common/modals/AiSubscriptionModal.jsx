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
import { X, Sparkles, Search, FileText, Zap, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const DEFAULT_PRESETS = {
    subscription: {
        title: 'Unlock AI Magic',
        subtitle: 'Transform your workflow with Text, Image and Hybrid search with AI',
        message: 'This premium module is not currently active on your account.',
        features: [
            { icon: 'Zap', text: 'AI-Powered Order' },
            { icon: 'Search', text: 'Smart Catalog Search' },
            { icon: 'FileText', text: 'Automated Quoting' },
        ],
        imageSrc: '/images/ai_unlock.png',
        contactLabel: 'Contact Admin',
    },
    upgrade: {
        title: 'Upgrade Your Plan',
        subtitle: 'Get more AI search credits and unlock premium features',
        message: 'You are running low on AI search tokens. Upgrade to continue searching without interruption.',
        features: [
            { icon: 'Zap', text: 'Unlimited AI Searches' },
            { icon: 'Search', text: 'Priority Search Results' },
            { icon: 'Sparkles', text: 'Advanced AI Matching' },
            { icon: 'FileText', text: 'Export & Share Designs' },
        ],
        imageSrc: '/images/ai_unlock.png',
        contactLabel: 'Talk to Sales',
    },
};

const ICON_MAP = { Zap, Search, FileText, Sparkles, Phone, Mail };

const AiSubscriptionModal = ({
    open,
    onClose,
    variant = 'subscription',
    title,
    subtitle,
    message,
    features,
    imageSrc,
    contactLabel,
    contactPhone = '+91 9510213581',
    contactEmail = 'Support@orail.in',
    showContact = true,
}) => {
    const preset = DEFAULT_PRESETS[variant] || DEFAULT_PRESETS.subscription;

    const resolvedTitle = title ?? preset.title;
    const resolvedSubtitle = subtitle ?? preset.subtitle;
    const resolvedMessage = message ?? preset.message;
    const resolvedFeatures = features ?? preset.features;
    const resolvedImageSrc = imageSrc ?? preset.imageSrc;
    const resolvedContactLabel = contactLabel ?? preset.contactLabel;

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
                                fontSize: { xs: '1.75rem', md: '2.25rem' },
                                lineHeight: 1.2,
                            }}
                        >
                            {resolvedTitle}
                        </Typography>

                        {/* Subtitle */}
                        <Typography
                            variant="h6"
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            sx={{
                                fontWeight: 600,
                                mb: 3,
                                color: 'text.secondary',
                                fontSize: { xs: '1rem', md: '1.1rem' },
                            }}
                        >
                            {resolvedSubtitle}
                        </Typography>

                        {/* Message */}
                        <Typography
                            variant="body1"
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            sx={{
                                color: 'text.secondary',
                                mb: 4,
                                lineHeight: 1.7,
                                fontSize: '0.95rem',
                            }}
                        >
                            {resolvedMessage}
                        </Typography>

                        {/* Features List */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            sx={{ mb: 4 }}
                        >
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                {resolvedFeatures.map((feature, index) => {
                                    const IconComp = typeof feature.icon === 'string' ? ICON_MAP[feature.icon] : null;
                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                px: 2,
                                                py: 1,
                                                borderRadius: '20px',
                                                background: 'rgba(115,103,240,0.08)',
                                                border: '1px solid rgba(115,103,240,0.2)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    background: 'rgba(115,103,240,0.12)',
                                                    transform: 'translateY(-2px)',
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#7367f0',
                                                }}
                                            >
                                                {IconComp ? <IconComp size={18} /> : feature.icon}
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#1a1a2e',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {feature.text}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        {/* Contact Box */}
                        {showContact && (
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(115,103,240,0.08) 0%, rgba(162,155,254,0.05) 100%)',
                                border: '2px solid rgba(115,103,240,0.2)',
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#7367f0',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    mb: 2,
                                }}
                            >
                                {resolvedContactLabel}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                                <Box
                                    component="a"
                                    href={`tel:${contactPhone.replace(/\s/g, '')}`}
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
                                    <Phone size={16} color="#7367f0" />
                                    <Typography
                                        sx={{
                                            color: '#1a1a2e',
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        {contactPhone}
                                    </Typography>
                                </Box>
                                <Box
                                    component="a"
                                    href={`mailto:${contactEmail}`}
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
                                    <Mail size={16} color="#7367f0" />
                                    <Typography
                                        sx={{
                                            color: '#1a1a2e',
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        {contactEmail}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        )}
                    </Box>

                    {/* Right Side - Illustration */}
                    <Box
                        sx={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Unlock Image - Full Size */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                src={resolvedImageSrc}
                                alt={resolvedTitle}
                                fill
                                style={{
                                    objectFit: 'cover',
                                }}
                                priority
                            />
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AiSubscriptionModal;

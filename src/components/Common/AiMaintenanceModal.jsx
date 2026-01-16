"use client";

import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    IconButton,
    Fade,
    Backdrop
} from '@mui/material';
import { X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import '../../Style/AiMaintenanceModal.scss';

const AiMaintenanceModal = ({ open, onClose, onSwitchToDesign }) => {
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
                        minHeight: { xs: 'auto', md: '450px' },
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
                            We are enhancing AI!
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
                            Sorry for the inconvenience!
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
                                mb: 2,
                                lineHeight: 1.7,
                                fontSize: '0.95rem',
                            }}
                        >
                            Currently working on enhancements to the AI module.
                            <br />
                            Thank you for your patience!
                        </Typography>

                        {/* Info Message */}
                        <Typography
                            variant="body2"
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            sx={{
                                color: 'text.secondary',
                                mb: 4,
                                fontSize: '0.9rem',
                            }}
                        >
                            We will keep you informed once the work is completed.
                        </Typography>

                        {/* Recommendation Box */}
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
                                mb: 4,
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
                                    mb: 1,
                                }}
                            >
                                💡 Recommended
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#1a1a2e',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                }}
                            >
                                Use Design Mode for seamless searching
                            </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexDirection: { xs: 'column', sm: 'row' },
                            }}
                        >
                            {onSwitchToDesign && (
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        onSwitchToDesign();
                                        onClose();
                                    }}
                                    endIcon={<ArrowRight size={18} />}
                                    fullWidth
                                    sx={{
                                        py: 1.75,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #7367f0 0%, #9e95f5 100%)',
                                        boxShadow: '0 8px 24px rgba(115, 103, 240, 0.35)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #6558e0 0%, #8d84e5 100%)',
                                            boxShadow: '0 12px 32px rgba(115, 103, 240, 0.45)',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    Switch to Design Mode
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Right Side - Illustration */}
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
                        {/* Decorative Circles */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: 'rgba(115,103,240,0.1)',
                                filter: 'blur(40px)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '-30px',
                                left: '-30px',
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                background: 'rgba(255,159,67,0.1)',
                                filter: 'blur(35px)',
                            }}
                        />

                        {/* Illustration */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '400px',
                                height: '350px',
                            }}
                        >
                            <Image
                                src="/ai_maintenance_illustration.png"
                                alt="AI Maintenance Illustration"
                                fill
                                style={{
                                    objectFit: 'contain',
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

export default AiMaintenanceModal;

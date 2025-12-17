import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Premium Page Header Component with Blur Effect
 * Provides consistent styling across all pages
 */
const PageHeader = ({
    leftContent,
    centerContent,
    rightContent,
    centerTitle,
    centerIcon: CenterIcon,
    layout = 'centered',
    sx = {}
}) => {
    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                p: '8px 16px !important',
                ...sx,
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: layout === 'fluid' ? 'space-between' : 'center',
                    minHeight: '40px',
                    gap: layout === 'fluid' ? 2 : 0,
                }}
            >
                {/* Left Section */}
                {leftContent && (
                    <Box
                        sx={layout === 'centered' ? {
                            position: 'absolute',
                            left: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                        } : {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexShrink: 0
                        }}
                    >
                        {leftContent}
                    </Box>
                )}

                {/* Center Section */}
                {(centerContent || centerTitle || CenterIcon) && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ...(layout === 'fluid' ? {
                            flex: 1,
                            minWidth: 0,
                            justifyContent: 'center'
                        } : {})
                    }}>
                        {CenterIcon && <CenterIcon size={22} />}
                        {centerTitle && (
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                    letterSpacing: '-0.01em',
                                    color: 'inherit'
                                }}
                            >
                                {centerTitle}
                            </Typography>
                        )}
                        {centerContent}
                    </Box>
                )}

                {/* Right Section */}
                {rightContent && (
                    <Box
                        sx={layout === 'centered' ? {
                            position: 'absolute',
                            right: 0,
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center'
                        } : {
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            flexShrink: 0
                        }}
                    >
                        {rightContent}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default PageHeader;

"use client";
import React from 'react';
import { logErrorToServer } from '@/utils/errorLogger';
import { Box, Typography, Button, Container, Paper, Collapse, IconButton } from '@mui/material';
import { RefreshCcw, Home, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        logErrorToServer({
            shortReason: `React Error Boundary: ${error.message}`,
            detailedReason: {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack
            }
        });
    }

    handleReset = () => {
        window.location.reload();
    };

    handleHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        background: 'radial-gradient(circle, #f9fafb 0%, #f3f4f6 100%)',
                    }}
                >
                    <Container maxWidth="sm">
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 4, md: 6 },
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: 'grey.200',
                                borderRadius: 8,
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        bgcolor: '#ffebee', // Red-50
                                        p: 3,
                                        borderRadius: '50%',
                                    }}
                                >
                                    <AlertTriangle size={44} color='#d32f2f' strokeWidth={1.5} />
                                </Box>
                            </Box>

                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{
                                    fontWeight: 800,
                                    color: 'text.primary',
                                    mb: 1,
                                    fontSize: { xs: '1.75rem', md: '2rem' }
                                }}
                            >
                                Something went wrong
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'text.secondary',
                                    mb: 4,
                                    maxWidth: 400,
                                    mx: 'auto',
                                    lineHeight: 1.6
                                }}
                            >
                                We sincerely apologize for the inconvenience. Our team has been notified and is working to resolve this immediately.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Home size={18} />}
                                    onClick={this.handleHome}
                                    sx={{
                                        px: 3,
                                        py: 1.25,
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        borderColor: 'grey.300',
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: 'text.primary',
                                            bgcolor: 'transparent'
                                        }
                                    }}
                                >
                                    Home
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<RefreshCcw size={18} />}
                                    onClick={this.handleReset}
                                    sx={{
                                        px: 3,
                                        py: 1.25,
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 6px -1px rgba(115, 103, 240, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 10px 15px -3px rgba(115, 103, 240, 0.4)',
                                            transform: 'translateY(-1px)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Try Again
                                </Button>
                            </Box>
                        </Paper>
                    </Container>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

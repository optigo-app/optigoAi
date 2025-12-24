"use client";
import React from 'react';
import { logErrorToServer } from '@/utils/errorLogger';
import { Box, Typography, Button } from '@mui/material';
import { RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
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

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh',
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                        m: 4
                    }}
                >
                    <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Something went wrong
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                        We've encountered an unexpected issue. The error has been logged and we'll look into it.
                        In the meantime, try refreshing the page.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<RefreshCcw size={18} />}
                        onClick={this.handleReset}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '1.05rem',
                            bgcolor: '#7367f0',
                            '&:hover': { bgcolor: '#5e50ee' }
                        }}
                    >
                        Try Again
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Container,
    Button
} from '@mui/material';
import { ShieldAlert, ExternalLink, LogIn } from 'lucide-react';

const UnauthorizedPage = () => {
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
                                bgcolor: '#f8d1d3',
                                p: 3,
                                borderRadius: '50%',
                            }}
                        >
                            <ShieldAlert size={44} color='#dc3545' strokeWidth={1.5} />
                        </Box>
                    </Box>

                    {/* Text Content */}
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            mb: 1,
                            fontSize: { xs: '1.875rem', md: '2.25rem' }
                        }}
                    >
                        Unauthorized Access
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            mb: 1,
                            maxWidth: 380,
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        You don’t have permission to access this page with your current account.
                        This may be due to missing access rights or an inactive session.
                    </Typography>

                    <Box sx={{ mt: 4, mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8, mb: 0.5 }}>
                            Please visit the link below for more information
                        </Typography>
                        <Button
                            href="https://login.optigoapps.com/Default.do"
                            target="_blank"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                color: 'primary.main',
                                p: 0,
                                minWidth: 0,
                                fontSize: '0.875rem',
                                '&:hover': {
                                    background: 'transparent',
                                    textDecoration: 'underline',
                                    color: 'primary.dark'
                                }
                            }}
                        >
                            https://login.optigoapps.com/Default.do
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default function App() {
    return (
        <Box sx={{ fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' }}>
            <UnauthorizedPage />
        </Box>
    );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function AuthenticatePage() {
    const router = useRouter();
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasscode, setShowPasscode] = useState(false);

    const validatePasscode = (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Please enter the passcode to continue.';
        }
        if (trimmed.toLowerCase() !== 'optigoapps') {
            return 'Invalid passcode. Please type "optigoapps" to continue.';
        }
        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoading) return;

        const validationError = validatePasscode(passcode);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        if (typeof window !== 'undefined') {
            const trimmed = passcode.trim();
            sessionStorage.setItem('optigo-auth', 'true');
            sessionStorage.setItem('optigo-auth-name', trimmed);
        }

        router.replace('/product');
    };

    const handlePasscodeChange = (event) => {
        setPasscode(event.target.value);
        if (error) setError('');
    };

    const toggleShowPasscode = () => {
        setShowPasscode((prev) => !prev);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSubmit(event);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const isAuthed = sessionStorage.getItem('optigo-auth') === 'true';
        if (isAuthed) {
            router.replace('/product');
        }
    }, [router]);

    return (
        <Box
            sx={{
                bgcolor: (theme) => theme.palette.background.default,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 4,
                py: { xs: 3, md: 2 },
                px: 2,
                filter: isLoading ? 'blur(2px)' : 'none',
                opacity: isLoading ? 0.3 : 1,
                transition: 'all 0.3s ease',
            }}
        >
            <Container maxWidth="sm">
                <Box textAlign="center" mb={{ xs: 3, md: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                ml: 1,
                                fontWeight: 700,
                                background:
                                    'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Optiogo AI
                        </Typography>
                    </Box>

                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Enter your passcode to access the application
                    </Typography>
                </Box>

                <Card
                    sx={{
                        boxShadow: '0 8px 32px rgba(115, 103, 240, 0.15)',
                        borderRadius: 3,
                        border: '1px solid rgba(115, 103, 240, 0.1)',
                        mt: { xs: 1, md: 2 },
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                        >
                            <Box textAlign="center" mb={2}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background:
                                            'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    }}
                                >
                                    <Lock size={32} color="white" />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Secure Access
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Passcode"
                                type={showPasscode ? 'text' : 'password'}
                                value={passcode}
                                onChange={handlePasscodeChange}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock size={20} color="#7367f0" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={toggleShowPasscode}
                                                edge="end"
                                                disabled={isLoading}
                                            >
                                                {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#7367f0',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#7367f0',
                                        },
                                    },
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading || !passcode.trim()}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    background:
                                        'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        background:
                                            'linear-gradient(270deg, rgba(115, 103, 240, 0.8) 0%, #6c5ce7 100%)',
                                        transform: 'translateY(-1px)',
                                    },
                                    '&:disabled': {
                                        background: '#e0e0e0',
                                        color: '#999',
                                    },
                                }}
                            >
                                {isLoading ? 'Authenticating...' : 'Access Application'}
                            </Button>

                            <Box textAlign="center" mt={2.5}>
                                {/* <Typography variant="caption" color="text.secondary">
                                    Hint: Try &ldquo;optigoapps&rdquo; as the passcode
                                </Typography> */}
                                {/* <br /> */}
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.7rem', mt: 1 }}
                                >
                                    Your session will be remembered until you close the browser
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Box textAlign="center" mt={{ xs: 2.5, md: 3.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        © 2025 OptigoApps. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import "../Style/header.scss";
import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const menuItemBaseStyles = {
    py: 1,
    mx: 1,
    my: .5,
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    '&:hover': { backgroundColor: 'action.hover' },
    '&:active': { backgroundColor: 'action.selected' }
};

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { totalCount } = useCart();
    const [anchorEl, setAnchorEl] = useState(null);
    const [userName, setUserName] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUserName(sessionStorage.getItem('optigo-auth-name') || 'User');
            setIsAuthenticated(sessionStorage.getItem('optigo-auth') === 'true');
        }
    }, []);

    const open = Boolean(anchorEl);

    const handleMenu = useCallback((e) => setAnchorEl(e.currentTarget), []);
    const handleClose = useCallback(() => setAnchorEl(null), []);

    const handleProfile = useCallback(() => {
        handleClose();
    }, [handleClose, router]);

    const handleLogout = useCallback(() => {
        handleClose();
    }, [handleClose]);


    return (
        <AppBar
            position="static"
            color="transparent"
            elevation={0}
            className="header"
            sx={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
        >
            <Toolbar className="container">
                {/* Left Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => router.push('/')}>
                    <Box
                        component="img"
                        src="/icons/base-icon.svg"
                        alt="Logo"
                        sx={{ height: 30, cursor: 'pointer' }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Optigo AI
                    </Typography>
                </Box>

                {/* Right Section */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    <Button
                        disableRipple
                        className="header-link"
                        onClick={() => router.push('/product')}
                        sx={{
                            color: pathname === '/product' ? 'primary.main' : 'text.primary',
                            fontWeight: pathname === '/product' ? 600 : 500,
                            borderBottom: '2px solid',
                            borderColor: pathname === '/product' ? 'primary.main' : 'transparent',
                            borderRadius: 0,
                            pb: 1,
                        }}
                    >
                        Products
                    </Button>
                    <IconButton sx={{ padding: '3px 10px', margin: '0' }} color="inherit" disableRipple onClick={() => router.push('/cart')}>
                        <Badge badgeContent={totalCount} color="primary" max={99}>
                            <ShoppingCart size={22} />
                        </Badge>
                    </IconButton>

                    {isAuthenticated && (
                        <>
                            <Avatar
                                sx={{ width: 32, height: 32, cursor: 'pointer', bgcolor: 'primary.main' }}
                                onClick={handleMenu}
                            >
                                {userName.charAt(0).toUpperCase()}
                            </Avatar>

                            {/* MENU */}
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{
                                    elevation: 2,
                                    sx: {
                                        mt: .5,
                                        minWidth: 160,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                    }
                                }}
                            >
                                <MenuItem onClick={handleProfile} sx={menuItemBaseStyles}>
                                    <User size={18} />
                                    <Typography variant="body2" fontWeight={500}>Profile</Typography>
                                </MenuItem>

                                <MenuItem
                                    onClick={handleLogout}
                                    sx={{
                                        ...menuItemBaseStyles,
                                        color: 'error.main',
                                        '&:hover': { backgroundColor: 'error.dark', color: 'error.contrastText' },
                                    }}
                                >
                                    <LogOut size={18} />
                                    <Typography variant="body2" fontWeight={500}>Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

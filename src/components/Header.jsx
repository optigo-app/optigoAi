'use client';

import React from 'react';
import "../Style/header.scss";
import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
    Badge,
    Typography,
} from '@mui/material';
import { ShoppingCart } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { totalCount } = useCart();

    if (pathname === '/' || pathname === '/test') return null;

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
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
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
                            p: "0 !important"
                        }}
                    >
                        Products
                    </Button>
                    <IconButton sx={{ margin: '0', padding: '0' }} color="inherit" disableRipple onClick={() => router.push('/cart')}>
                        <Badge badgeContent={totalCount} color="primary" max={99}>
                            <ShoppingCart size={22} />
                        </Badge>
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

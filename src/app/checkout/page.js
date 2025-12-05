"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Container,
    Box,
    Typography,
    Button,
    IconButton,
    Grid,
    Paper,
    CircularProgress,
} from "@mui/material";
import { ArrowLeft, Palette, ShoppingBag, Sparkles, ShoppingCart } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { buildQuoteRedirectUrl } from "@/utils/globalFunc";
import { SaveCartApi } from "../api/SaveCartApi";

/* ----------------------------------------------------
   ACTION CONFIG — Adding new actions requires only this
---------------------------------------------------- */
const ACTION_CONFIG = {
    quote: {
        title: "Add to Quote",
        description: "Add these items to your quotation for future reference and inspiration",
        api: SaveCartApi,
        successMessage: "Items added to Quotation!",
        postMessageEvent: "Quotation",
        responseKey: "QID",

        ui: {
            icon: <Palette size={32} />,
            iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            cardBg: "linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)",
            buttonBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            buttonHover: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
        },
    },

    stock: {
        title: "Add to Album",
        description: "Add these items to your album for future reference and inspiration",
        api: SaveCartApi,
        successMessage: "Items added to Album!",
        postMessageEvent: "Album",
        responseKey: "QID",

        ui: {
            icon: <ShoppingBag size={32} />,
            iconBg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            cardBg: "linear-gradient(135deg, #fff8f8 0%, #fff0f0 100%)",
            buttonBg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            buttonHover: "linear-gradient(135deg, #e683f0 0%, #e64a60 100%)",
        },
    },
};

/* ----------------------------------------------------
   SEPARATE FUNCTION — sends iframe post message
---------------------------------------------------- */
const sendPostMessage = (event, code) => {
    window.parent.postMessage(
        {
            type: "ADD_TAB",
            evt: event,
            payload: { code },
        },
        "*"
    );
};

/* ----------------------------------------------------
   REUSABLE ACTION CARD
---------------------------------------------------- */
const ActionCard = ({ actionKey, config, loading, onClick }) => {
    const { title, description, ui } = config;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 0,
                borderRadius: 4,
                overflow: "hidden",
                background: ui.cardBg,
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.08)",
                transition: "0.3s",
                cursor: "pointer",
                "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                },
            }}
        >
            {/* Header */}
            <Box sx={{ p: 4, pb: 3, textAlign: "center", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}>
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: ui.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                        color: "white",
                    }}
                >
                    {ui.icon}
                </Box>

                <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                    {title}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
                    {description}
                </Typography>
            </Box>

            {/* Button */}
            <Box sx={{ p: 4 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={onClick}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Sparkles size={20} />}
                    sx={{
                        py: 2,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        background: ui.buttonBg,
                        "&:hover": { background: ui.buttonHover },
                    }}
                >
                    {loading ? "Processing..." : `Continue with ${title}`}
                </Button>
            </Box>
        </Paper>
    );
};

/* ----------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------- */
const CheckoutPage = () => {
    const router = useRouter();
    const { items: cartItems } = useCart();
    const { showSuccess, showError } = useToast();

    const [loading, setLoading] = useState({});

    const totalItems = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const handleBack = () => router.push("/cart");

    /* Core Action Handler — no UI logic here */
    const handleAction = async (actionKey) => {
        const config = ACTION_CONFIG[actionKey];
        if (!config) return;

        setLoading((p) => ({ ...p, [actionKey]: true }));

        try {
            const response = await config.api(cartItems);
            showSuccess(config.successMessage);

            const code = response?.data?.rd?.[0]?.[config.responseKey];
            const curVersion = cartItems[0]?.cuVer
            const url = buildQuoteRedirectUrl(code, curVersion)
            if (code) sendPostMessage(config.postMessageEvent, code);

        } catch (err) {
            console.error(err);
            showError(err?.message || "Something went wrong.");
        } finally {
            setLoading((p) => ({ ...p, [actionKey]: false }));
        }
    };

    return (
        <Box sx={{ pb: 3 }}>
            <Container maxWidth="false">
                {/* Header */}
                <Box sx={{ mb: 6 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "start",
                            justifyContent: "center",
                            position: "relative",
                            py: 2,
                            mb: 2,
                            borderBottom: 1,
                            borderColor: "grey.200",
                        }}
                    >
                        <IconButton onClick={handleBack} sx={{ position: "absolute", left: 0 }}>
                            <ArrowLeft />
                        </IconButton>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <ShoppingCart size={20} />
                            <Typography variant="h6" fontWeight={600}>
                                Checkout ({totalItems})
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Dynamic Config-based Action Cards */}
                <Grid container spacing={4} justifyContent="center">
                    {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                        <Grid key={key} size={{ xs: 12, md: 6, lg: 4 }}>
                            <ActionCard
                                actionKey={key}
                                config={cfg}
                                loading={!!loading[key]}
                                onClick={() => handleAction(key)}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default CheckoutPage;

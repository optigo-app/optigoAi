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
import { ArrowLeft, ShoppingCart, Images, FileText } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { buildQuoteRedirectUrl } from "@/utils/globalFunc";
import { SaveCartApi } from "@/app/api/SaveCartApi";
import GridBackground from "../Common/GridBackground";
import PageHeader from "../Common/PageHeader";

/* ----------------------------------------------------
   ACTION CONFIG — Adding new actions requires only this
   ---------------------------------------------------- */
const ACTION_BUTTON_BG = "#7367f0";
const ACTION_BUTTON_HOVER = "#5e56d6";

const ACTION_CONFIG = {
    album: {
        title: "Add to Album",
        description: "Add items to album for future reference",
        api: SaveCartApi,
        successMessage: "Items added to Album!",
        postMessageEvent: "Album",
        responseKey: "QID",

        ui: {
            icon: <Images size={24} color="#ff9f43" />,
            iconBg: "#fff7ed",
            cardBg: "#ffffff",
            buttonBg: ACTION_BUTTON_BG,
            buttonHover: ACTION_BUTTON_HOVER,
        },
    },

    quote: {
        title: "Add to Quote",
        description: "Add items to quotation for reference",
        api: SaveCartApi,
        successMessage: "Items added to Quotation!",
        postMessageEvent: "Quotation",
        responseKey: "QID",

        ui: {
            icon: <FileText size={24} color="#667eea" />,
            iconBg: "#f5f7ff",
            cardBg: "#ffffff",
            buttonBg: ACTION_BUTTON_BG,
            buttonHover: ACTION_BUTTON_HOVER,
        },
    },

    order: {
        title: "Add to Order",
        description: "Add items to order for processing",
        api: SaveCartApi,
        successMessage: "Items added to Order!",
        postMessageEvent: "Order",
        responseKey: "QID",

        ui: {
            icon: <ShoppingCart size={24} color="#10ac84" />,
            iconBg: "#e3fff1",
            cardBg: "#ffffff",
            buttonBg: ACTION_BUTTON_BG,
            buttonHover: ACTION_BUTTON_HOVER,
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
                borderRadius: 2,
                overflow: "hidden",
                background: ui.cardBg,
                border: "1px solid",
                borderColor: "divider",
                transition: "0.3s",
                cursor: "pointer",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
            }}
        >
            {/* Header */}
            <Box sx={{ p: 3, pb: 2, textAlign: "center" }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: ui.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                    }}
                >
                    {ui.icon}
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    {title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: "auto", lineHeight: 1.4 }}>
                    {description}
                </Typography>
            </Box>

            {/* Button */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    onClick={onClick}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : ''}
                    sx={{
                        py: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        borderColor: "transparent",
                        color: ui.buttonHover,
                        background: "rgba(115, 103, 240, 0.08)",
                        boxShadow: "none",
                        "&:hover": {
                            background: "rgba(115, 103, 240, 0.12)",
                            borderColor: "transparent",
                            color: ui.buttonBg,
                            boxShadow: "none"
                        },
                    }}
                >
                    {loading ? "Processing..." : `Continue with ${title}`}
                </Button>
            </Box>
        </Paper >
    );
};

/* ----------------------------------------------------
   MAIN COMPONENT
   ---------------------------------------------------- */
const CheckoutClient = () => {
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
        <GridBackground>
            <Container maxWidth={false} sx={{ position: "relative", zIndex: 2, px: '0 !important' }}>
                <PageHeader
                    centerTitle="Checkout"
                    centerIcon={ShoppingCart}
                    leftContent={
                        <>
                            <IconButton onClick={handleBack}>
                                <ArrowLeft size={20} />
                            </IconButton>
                            {totalItems > 1 && (
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                    {totalItems} products
                                </Typography>
                            )}
                        </>
                    }
                />
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", p: '10px 16px !important', mt: 2 }}>
                    {/* Dynamic Config-based Action Cards */}
                    <Grid container spacing={3} justifyContent="center" alignItems="center">
                        {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                            <Grid key={key} size={{ xs: 12, md: 6, lg: 2.4 }}>
                                <ActionCard
                                    actionKey={key}
                                    config={cfg}
                                    loading={!!loading[key]}
                                    onClick={() => handleAction(key)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </GridBackground>
    );
};

export default CheckoutClient;

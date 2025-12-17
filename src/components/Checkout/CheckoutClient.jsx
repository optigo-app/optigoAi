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
import { ArrowLeft, ShoppingCart, Images, FileText, Sparkles } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { buildQuoteRedirectUrl } from "@/utils/globalFunc";
import { SaveCartApi } from "@/app/api/SaveCartApi";
import GridBackground from "../Common/GridBackground";
import PageHeader from "../Common/PageHeader";

/* ----------------------------------------------------
   ACTION CONFIG — Adding new actions requires only this
   ---------------------------------------------------- */
const ACTION_CONFIG = {
    album: {
        title: "Add to Album",
        description: "Add these items to your album for future reference and inspiration",
        api: SaveCartApi,
        successMessage: "Items added to Album!",
        postMessageEvent: "Album",
        responseKey: "QID",

        ui: {
            icon: <Images size={32} />,
            iconBg: "linear-gradient(135deg, #ff9f43 0%, #ff6b00 100%)",
            cardBg: "linear-gradient(135deg, #fff7ed 0%, #fff0df 100%)",
            buttonBg: "linear-gradient(135deg, #ff9f43 0%, #ff6b00 100%)",
            buttonHover: "linear-gradient(135deg, #ff8c1a 0%, #e65b00 100%)",
        },
    },

    quote: {
        title: "Add to Quote",
        description: "Add these items to your quotation for future reference and inspiration",
        api: SaveCartApi,
        successMessage: "Items added to Quotation!",
        postMessageEvent: "Quotation",
        responseKey: "QID",

        ui: {
            icon: <FileText size={32} />,
            iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            cardBg: "linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)",
            buttonBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            buttonHover: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
        },
    },

    order: {
        title: "Add to Order",
        description: "Add these items to your order for future reference and inspiration",
        api: SaveCartApi,
        successMessage: "Items added to Order!",
        postMessageEvent: "Order",
        responseKey: "QID",

        ui: {
            icon: <ShoppingCart size={32} />,
            iconBg: "linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)",
            cardBg: "linear-gradient(135deg, #f0fff7 0%, #e3fff1 100%)",
            buttonBg: "linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)",
            buttonHover: "linear-gradient(135deg, #14c79a 0%, #0f9b77 100%)",
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
                p: 2,
                borderRadius: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
                background: ui.cardBg,
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.08)",
                transition: "0.3s",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                },
            }}
        >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
                <Box
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: ui.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        color: "white",
                    }}
                >
                    {React.cloneElement(ui.icon, { size: 24 })}
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: "1rem" }}>
                    {title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", lineHeight: 1.4 }}>
                    {description}
                </Typography>
            </Box>

            {/* Button */}
            <Box>
                <Button
                    fullWidth
                    variant="contained"
                    size="medium"
                    onClick={onClick}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : <Sparkles size={16} />}
                    sx={{
                        py: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        background: ui.buttonBg,
                        "&:hover": { background: ui.buttonHover },
                        boxShadow: "none",
                    }}
                >
                    {loading ? "Processing..." : `Continue`}
                </Button>
            </Box>
        </Paper>
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
                <Box
                    sx={{
                        maxWidth: 1200,
                        mx: "auto",
                        mt: 4,
                        p: { xs: 2, md: 4, lg: 8 },
                        borderRadius: 4,
                        bgcolor: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                        border: "1px solid rgba(255,255,255,0.8)",
                    }}
                >
                    {/* Dynamic Config-based Action Cards */}
                    <Grid container spacing={2} justifyContent="center">
                        {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                            <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
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

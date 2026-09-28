"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Link,
    Fade,
    Backdrop,
    Checkbox,
} from "@mui/material";
import { motion } from "framer-motion";

const AiPrivacyModal = () => {
    const [open, setOpen] = useState(false);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const [needsScroll, setNeedsScroll] = useState(true);
    const [checked, setChecked] = useState(false);
    const scrollRef = useRef(null);
    const pathname = usePathname();

    useEffect(() => {
        const accepted = localStorage.getItem("optigoAiPrivacyAccepted");

        if (!accepted && pathname !== "/privacy-policy") {
            setOpen(true);
        } else if (pathname === "/privacy-policy") {
            setOpen(false);
        }
    }, [pathname]);

    useEffect(() => {
        if (!open) return;

        const checkScroll = () => {
            const el = scrollRef.current;
            if (!el) return;
            const overflow = el.scrollHeight - el.clientHeight;
            if (overflow <= 5) {
                setNeedsScroll(false);
            } else {
                setNeedsScroll(true);
            }
        };

        const timer = setTimeout(checkScroll, 100);
        window.addEventListener("resize", checkScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", checkScroll);
        };
    }, [open]);

    const handleScroll = (e) => {
        const element = e.target;

        const reachedBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight <
            5;

        if (reachedBottom) {
            setScrolledToBottom(true);
        }
    };

    const canAccept = needsScroll ? scrolledToBottom : checked;

    const handleAccept = () => {
        if (!canAccept) return;

        localStorage.setItem("optigoAiPrivacyAccepted", "true");
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown
            TransitionComponent={Fade}
            fullWidth
            maxWidth="sm"
            onClose={(event, reason) => {
                if (reason === "backdropClick") return;
            }}
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 400,
                sx: {
                    backdropFilter: "blur(10px)",
                    background: "rgba(0,0,0,.55)",
                },
            }}
            PaperProps={{
                sx: {
                    width: {
                        xs: "calc(100% - 16px)",
                        sm: "720px",
                    },
                    maxWidth: "720px",
                    height: {
                        xs: "92vh",
                        sm: "90vh",
                    },
                    maxHeight: "90vh",
                    borderRadius: {
                        xs: "28px 28px 0 0",
                        sm: "30px",
                    },
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 25px 60px rgba(0,0,0,.2)",
                },
            }}
        >
            <DialogContent
                sx={{
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                }}
            >
                {/* Header */}

                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    sx={{
                        px: {
                            xs: 3,
                            sm: 5,
                        },
                        pt: {
                            xs: 4,
                            sm: 5,
                        },
                        pb: 3,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: {
                                xs: "1rem",
                                sm: "1.2rem",
                            },
                            fontWeight: 600,
                            color: "#202124",
                            lineHeight: 1.2,
                        }}
                    >
                        Chat Privately with OptigoAI
                    </Typography>
                </Box>

                {/* Scroll Content */}

                <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    ref={(el) => { scrollRef.current = el; }}
                    onScroll={handleScroll}
                    sx={{
                        flex: 1,
                        overflowY: "auto",

                        px: {
                            xs: 3,
                            sm: 5,
                        },

                        pr: {
                            xs: 2,
                            sm: 3,
                        },

                        "&::-webkit-scrollbar": {
                            width: 7,
                        },

                        "&::-webkit-scrollbar-thumb": {
                            background: "#d8d8d8",
                            borderRadius: 20,
                        },

                        "&::-webkit-scrollbar-track": {
                            background: "transparent",
                        },
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                            },
                            color: "#5f6368",
                            lineHeight: 1.9,
                            mb: 4,
                        }}
                    >
                        OptigoAI is a private AI assistant that enhances your
                        browsing and search experience. OptigoAI is available
                        free with limited usage. Premium subscribers receive
                        access to additional AI models, increased usage limits,
                        and early access to upcoming features.
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                            },
                            color: "#5f6368",
                            lineHeight: 1.9,
                            mb: 4,
                        }}
                    >
                        When you ask OptigoAI questions related to the current
                        webpage, the webpage content, highlighted text, and your
                        search query may be securely sent to our AI services in
                        order to generate responses. In some situations,
                        OptigoAI may also use search services to improve answer
                        quality.
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                            },
                            color: "#5f6368",
                            lineHeight: 1.9,
                            mb: 4,
                        }}
                    >
                        AI responses can occasionally be inaccurate or
                        incomplete. Avoid sharing confidential information and
                        use discretion when relying on responses involving
                        financial, medical, legal, or safety-related matters.
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                            },
                            color: "#5f6368",
                            lineHeight: 1.9,
                            mb: 4,
                        }}
                    >
                        OptigoAI does not use your conversations to train AI
                        models. Personal data is not permanently stored on our
                        servers, and we avoid collecting personally identifiable
                        information wherever possible.
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                            },
                            color: "#5f6368",
                            lineHeight: 1.9,
                            mb: 5,
                        }}
                    >
                        See our{" "}
                        <Link
                            href="/privacy-policy"
                            underline="hover"
                            sx={{
                                color: "#7367f0",
                                fontWeight: 600,
                            }}
                        >
                            Privacy Policy
                        </Link>{" "}
                        for complete information about how your data is handled.
                    </Typography>
                </Box>

                {/* Bottom Fade */}

                <Box
                    sx={{
                        height: 24,
                        background:
                            "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
                        flexShrink: 0,
                    }}
                />

                {/* Footer */}

                <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    sx={{
                        px: {
                            xs: 3,
                            sm: 4,
                        },
                        py: {
                            xs: 2,
                            sm: 2.5,
                        },
                        borderTop: "1px solid #ececec",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    {!needsScroll ? (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            <Checkbox
                                checked={checked}
                                onChange={(e) => setChecked(e.target.checked)}
                                sx={{
                                    color: "#7367f0",
                                    "&.Mui-checked": { color: "#7367f0" },
                                    p: 0.5,
                                    mr: 0.5,
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: { xs: "0.8rem", sm: "0.85rem" },
                                    color: "#5f6368",
                                    fontWeight: 500,
                                }}
                            >
                                I understand and agree to the privacy notice
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ flex: 1 }} />
                    )}
                    <Button
                        variant="contained"
                        disabled={!canAccept}
                        onClick={handleAccept}
                        sx={{
                            height: {
                                xs: 40,
                                sm: 44,
                            },

                            px: {
                                xs: 3,
                                sm: 4,
                            },

                            ml: "auto",

                            borderRadius: "999px",

                            textTransform: "none",

                            fontWeight: 600,

                            fontSize: "0.95rem",

                            whiteSpace: "nowrap",

                            background:
                                "linear-gradient(270deg, rgba(115,103,240,0.7) 0%, #7367f0 100%)",

                            boxShadow:
                                "0 4px 16px rgba(115,103,240,.4)",

                            "&:hover": {
                                background:
                                    "linear-gradient(270deg, rgba(115,103,240,0.8) 0%, #7367f0 100%)",
                            },

                            "&:disabled": {
                                background: "rgba(115,103,240,.35)",
                                color: "#fff",
                            },
                        }}
                    >
                        Accept &amp; Continue
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AiPrivacyModal;
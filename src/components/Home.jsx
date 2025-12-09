"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ModernSearchBar from "./ModernSearchBar";
import { Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import { fileToBase64 } from "@/utils/globalFunc";
import { ModeSwitch } from "./Common/HomeCommon";
import { GradientWaves } from "./animation/GradientWaves";
import { MouseOrbs } from "./animation/MouseOrbs";

// --- ANIMATION CONFIG ---
const floatAnimation = {
    animate: {
        y: [0, -15, 0],
        rotate: [0, 4, 0],
        scale: [1, 1.02, 1]
    },
    transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

// --- COMPONENTS ---

const TypewriterText = ({ text }) => {
    const letters = Array.from(text);

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.035, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", damping: 12, stiffness: 200 }
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: { type: "spring", damping: 12, stiffness: 200 }
        },
    };

    return (
        <motion.div
            style={{ display: "inline-flex", whiteSpace: "nowrap" }}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index}>
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.div>
    );
};

// Continuous looping typewriter for subtitle
const ContinuousTypewriter = ({ texts, delay = 0 }) => {
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(50);

    // Convert single text to array for backward compatibility
    const textArray = Array.isArray(texts) ? texts : [texts];

    useEffect(() => {
        let timer;
        const handleType = () => {
            const current = loopNum % textArray.length;
            const fullText = textArray[current];

            setDisplayText(isDeleting
                ? fullText.substring(0, displayText.length - 1)
                : fullText.substring(0, displayText.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 50);

            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && displayText === "") {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, loopNum, typingSpeed, textArray]);

    return (
        <span style={{ borderRight: "2px solid #7367f0", paddingRight: "4px" }}>
            {displayText}
        </span>
    );
};

const upcomingFeatures = [
    "AI style recommendations",
    "Saved favourites & wishlists",
    "Shareable design moodboards",
    "Try-on preview for rings & bangles",
];

const Home = () => {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState("design");
    const [isLoaded, setIsLoaded] = useState(false);
    const [featureIndex, setFeatureIndex] = useState(0);
    const [appliedFilters, setAppliedFilters] = useState([]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!upcomingFeatures.length) return;
        const interval = setInterval(() => {
            setFeatureIndex((prev) => (prev + 1) % upcomingFeatures.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = async (searchData) => {
        let imageBase64 = null;
        if (searchData.image instanceof File) {
            imageBase64 = await fileToBase64(searchData.image);
        }
        const searchPayload = {
            ...searchData,
            image: imageBase64,
            mode: selectedMode,
            timestamp: Date.now(),
            filters: appliedFilters,
        };
        const jsonString = JSON.stringify(searchPayload);
        const encoded = btoa(unescape(encodeURIComponent(jsonString)));
        sessionStorage.setItem("homeSearchData", encoded);
        router.push("/product");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "#f8f9fa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                pt: "05vh",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* --- GRID & GRADIENT OVERLAY --- */}
            <GradientWaves />
            {/* <MouseOrbs count={15} /> */}

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "linear-gradient(rgba(115, 103, 240, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(115, 103, 240, 0.03) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    width: "100%",
                    height: "100%",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            />
            {/* Center Glow */}
            <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "70vw",
                height: "70vw",
                opacity: 0.5,
                background: "radial-gradient(circle, rgba(115,103,240,0.18) 0%, transparent 60%)",
                filter: "blur(100px)",
                zIndex: 0
            }} />


            {/* --- ANIMATED BLOBS (Side Accents) --- */}
            <motion.div
                {...floatAnimation}
                style={{
                    position: "absolute",
                    top: "5%",
                    left: "10%",
                    width: "350px",
                    height: "350px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(115,103,240,0.25) 0%, rgba(162,155,254,0.15) 100%)",
                    filter: "blur(80px)",
                    zIndex: 0
                }}
            />
            <motion.div
                animate={{ y: [0, 40, 0], x: [0, -40, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    bottom: "10%",
                    right: "10%",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(255,100,100,0.15) 0%, rgba(255,159,67,0.1) 100%)",
                    filter: "blur(90px)",
                    zIndex: 0
                }}
            />

            <Container
                maxWidth="md"
                sx={{
                    position: "relative",
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >

                {/* --- BRANDING (In-Flow, Tight Spacing) --- */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 4,
                        backdropFilter: "blur(10px)",
                        borderRadius: "24px",
                    }}
                >
                    <Box>
                        <Image
                            src="/icons/base-icon.svg"
                            alt="Hero Image"
                            width={60}
                            height={60}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                marginBottom: 2,
                            }}
                        />
                    </Box>
                </Box>

                {/*new feature*/}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                    sx={{
                        mb: 4,
                        px: 2,
                        py: 1.1,
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        background: "rgba(255,255,255,0.45)",
                        backdropFilter: "blur(15px)",
                        maxWidth: 720,
                        mx: 'auto',
                        overflow: 'hidden',
                    }}
                >
                    <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box
                                sx={{
                                    px: 0.8,
                                    py: 0.25,
                                    borderRadius: 999,
                                    fontSize: 11,
                                    fontWeight: 500,
                                    letterSpacing: 0.4,
                                    textTransform: 'uppercase',
                                    background: 'rgba(129,140,248,0.10)',
                                    color: '#4f46e5',
                                    border: '1px solid rgba(129,140,248,0.40)'
                                }}
                            >
                                New
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: '#475569',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {upcomingFeatures[featureIndex]}
                            </Typography>
                            <ArrowRight size={16} color="#94a3b8" style={{ marginLeft: 4 }} />
                        </Box>
                    </motion.div>
                </Box>

                {/* Hero Text */}
                <Box sx={{ mb: 3, textAlign: "center" }}>
                    <Typography
                        variant="h1"
                        fontWeight="600"
                        sx={{
                            fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
                            whiteSpace: "nowrap",
                            mb: 1.5,
                            letterSpacing: "-1px",
                            lineHeight: 1.1,
                            color: "#475569",
                            opacity: 0.9,
                        }}
                    >
                        <TypewriterText text="Think it. Type it. Launch it." />
                    </Typography>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 600, mx: "auto", fontSize: "1.1rem", opacity: 0.8, height: "1.5rem" }}>
                            <ContinuousTypewriter texts={["Your AI-powered jewelry design studio.", "Stunning custom jewelry pieces.", "Unique rings, necklaces & more."]} />
                        </Typography>
                    </motion.div>
                </Box>

                {/* Mode Selection Pill */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                >
                    <ModeSwitch selectedMode={selectedMode} onSelect={setSelectedMode} />
                </motion.div>

                {/* Search Bar */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.6, type: "spring", stiffness: 100 }}
                    sx={{ width: "100%", maxWidth: 800 }}
                >
                    <ModernSearchBar
                        onSubmit={handleSearch}
                        appliedFilters={appliedFilters}
                        onApply={setAppliedFilters}
                        initialExpanded={true}
                        alwaysExpanded={true}
                        showMoreFiltersButton={false}
                    />
                </Box>

            </Container>
        </Box>
    );
}

export default Home;

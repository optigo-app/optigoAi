"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

const MESSAGE_SETS = {
    text: [
        "Understanding your search query...",
        "Scanning through design collections...",
        "Analyzing patterns and themes...",
        "Matching text to visual designs...",
        "Filtering for the best results...",
        "Refining search accuracy...",
        "Curating relevant designs...",
        "Almost there...",
    ],
    image: [
        "Analyzing your image...",
        "Extracting visual features...",
        "Comparing with design database...",
        "Finding visually similar patterns...",
        "Matching colors and textures...",
        "Scanning thousands of designs...",
        "Ranking by visual similarity...",
        "Almost there...",
    ],
    hybrid: [
        "Processing image and text...",
        "Combining visual and textual cues...",
        "Analyzing design patterns...",
        "Cross-referencing features...",
        "Matching colors, shapes and keywords...",
        "Filtering for best matches...",
        "Refining hybrid results...",
        "Almost there...",
    ],
    similar: [
        "Finding visual matches...",
        "Analyzing design elements...",
        "Comparing patterns and styles...",
        "Searching for similar designs...",
        "Matching colors and compositions...",
        "Scanning the collection...",
        "Ranking by similarity...",
        "Almost there...",
    ],
};

const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const RotatingLoadingText = ({ type = "text", interval = 2500 }) => {
    const [messages, setMessages] = useState(() => shuffle(MESSAGE_SETS[type] || MESSAGE_SETS.text));
    const [messageIndex, setMessageIndex] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        const baseMessages = MESSAGE_SETS[type] || MESSAGE_SETS.text;
        setMessages(shuffle(baseMessages));
        setMessageIndex(0);
    }, [type]);

    useEffect(() => {
        if (!messages.length) return;

        timerRef.current = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % messages.length);
        }, interval);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [interval, messages.length]);

    const currentMessage = messages[messageIndex] || "";

    return (
        <Box
            sx={{
                minHeight: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={messageIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ textAlign: "center" }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: "inherit",
                            fontWeight: 500,
                            letterSpacing: "0.3px",
                            textAlign: "center",
                        }}
                    >
                        {currentMessage}
                    </Typography>
                </motion.div>
            </AnimatePresence>
        </Box>
    );
};

export default RotatingLoadingText;

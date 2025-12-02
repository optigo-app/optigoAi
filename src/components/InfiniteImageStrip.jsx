"use client";

import React from "react";
import Image from "next/image";
import { Box, Container } from "@mui/material";

const DEFAULT_IMAGES = [
    "/images/womans-face-with-emerald-earrings.jpg",
    "/images/diamond-bangle-bracelet.jpg",
    "/images/emerald-and-diamond-bracelet.jpg",
    "/images/emerald-diamond-necklace.jpg",
    "/images/yellow-topaz-diamond-necklace.jpg",
    "/images/emerald-necklace-with-matching-earrings.jpg",
    "/images/sapphire-chandelier-earrings.jpg",
    "/images/diamond-cocktail-earrings.jpg",
    "/images/green-emerald-necklace-luxury.jpg",
    "/images/yellow-topaz-chandelier-earrings.jpg",
    "/images/amethyst-diamond-necklace.jpg",
    "/images/emerald-necklace-with-pearls.jpg",
];

const InfiniteImageStrip = ({
    images = DEFAULT_IMAGES,
    speed = "normal",
    height = 330,
    width = 275,
    direction = "left",
}) => {
    const duration = speed === "slow" ? 55 : speed === "fast" ? 30 : 45;

    const scrollingImages = [...images, ...images];

    const isLeft = direction === "left";
    const animationName = isLeft ? "scroll-strip-left" : "scroll-strip-right";

    return (
        <Box sx={{ py: 2 }}>
            <Container maxWidth={false}>
                <Box
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            width: "max-content",
                            animation: `${duration}s linear 0s infinite ${animationName}`,
                            "@keyframes scroll-strip-left": {
                                "0%": { transform: "translateX(0)" },
                                "100%": { transform: "translateX(-50%)" },
                            },
                            "@keyframes scroll-strip-right": {
                                "0%": { transform: "translateX(-50%)" },
                                "100%": { transform: "translateX(0)" },
                            },
                        }}
                    >
                        {scrollingImages?.map((src, index) => (
                            <Box
                                key={`${src}-${index}`}
                                sx={{
                                    minWidth: { xs: 140, sm: 180, md: width },
                                    height: { xs: 140, sm: 180, md: height },
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    position: "relative",
                                    mr: 2,
                                    flexShrink: 0,
                                }}
                            >
                                <Image
                                    src={src}
                                    alt="Jewelry piece"
                                    fill
                                    sizes="(max-width: 600px) 160px, (max-width: 960px) 200px, 260px"
                                    style={{ objectFit: "cover" }}
                                    priority={index < images.length}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default React.memo(InfiniteImageStrip);

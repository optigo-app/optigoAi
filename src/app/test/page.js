"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
} from "@mui/material";
import products from "../../data/Product.json"
import { designCollectionApi } from "../api/designCollectionApi";

export default function JewelryProductGrid() {
    const [data, setData] = useState([]);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                const res = await designCollectionApi();
                const allProducts = res?.rd || [];
                if (!mounted) return;
                setData(allProducts.slice(0, 50));
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
        return () => {
            mounted = false;
        };
    }, []);

    const imageSrc = useMemo(() => {
        if (imageError) return "/images/image-not-found.jpg";
        if (data?.ImgUrl) return data.ImgUrl;
        if (data?.image) return data.image;
        return "/images/image-not-found.jpg";
    }, [imageError, data]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 5, px: 2 }}>
            <Box sx={{ maxWidth: 1400, mx: "auto", textAlign: "center", mb: 6 }}>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                    Jewelry Collection
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Discover our exquisite collection of luxury jewelry
                </Typography>
            </Box>

            <Grid container spacing={1}>
                {data.map((product) => (
                    <Grid
                        item
                        key={product.id}
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        xl={2}
                        size={{
                            xs: 6,
                            sm: 4,
                            md: 3,
                            lg: 3,
                            xl: 2,
                        }}
                    >
                        <Card
                            sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                transition: "transform 0.3s, box-shadow 0.3s",
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow:
                                        "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    position: "relative",
                                    width: "100%",
                                    pt: "100%", // 1:1 aspect ratio
                                    overflow: "hidden",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={product.ImgUrl || product.image || "/images/image-not-found.jpg"}
                                    alt={product.type}
                                    onError={(e) => (e.currentTarget.src = "/images/image-not-found.jpg")}
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transition: "transform 0.3s",
                                        "&:hover": { transform: "scale(1.1)" },
                                    }}
                                />

                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

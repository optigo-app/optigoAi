"use client";
import React, { useMemo } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
} from "@mui/material";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const ProductSummaryCards = ({ products }) => {
    const summaryData = useMemo(() => {
        if (!products || products.length === 0) {
            return {
                totalProducts: 0,
                totalWeight: 0,
                totalDiamonds: 0,
                totalStones: 0,
                categoryBreakdown: [],
                metalTypeBreakdown: [],
                collectionBreakdown: [],
            };
        }

        // Calculate total products
        const totalProducts = products.length;

        // Calculate total weight
        const totalWeight = products.reduce((sum, p) => sum + (parseFloat(p.ActualGrossweight) || 0), 0);

        // Calculate total diamonds
        const totalDiamonds = products.reduce((sum, p) => sum + (parseInt(p.diamondpcs) || 0), 0);

        // Calculate total stones
        const totalStones = products.reduce((sum, p) => sum + (parseInt(p.stonepcs) || 0), 0);

        // Category breakdown for chart
        const categoryCount = {};
        products.forEach(p => {
            const cat = p.categoryname || 'Unknown';
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        const categoryBreakdown = Object.entries(categoryCount)
            .slice(0, 7)
            .map(([name, value]) => ({ name, value }));

        // Metal type breakdown
        const metalCount = {};
        products.forEach(p => {
            const metal = p.metaltype || 'Unknown';
            metalCount[metal] = (metalCount[metal] || 0) + 1;
        });
        const metalTypeBreakdown = Object.entries(metalCount)
            .slice(0, 7)
            .map(([name, value]) => ({ name, value }));

        // Collection breakdown
        const collectionCount = {};
        products.forEach(p => {
            const col = p.collectionname || 'Unknown';
            collectionCount[col] = (collectionCount[col] || 0) + 1;
        });
        const collectionBreakdown = Object.entries(collectionCount)
            .slice(0, 7)
            .map(([name, value]) => ({ name, value }));

        return {
            totalProducts,
            totalWeight,
            totalDiamonds,
            totalStones,
            categoryBreakdown,
            metalTypeBreakdown,
            collectionBreakdown,
        };
    }, [products]);

    const cards = [
        {
            title: "Total Products",
            value: summaryData.totalProducts,
            subtitle: `${summaryData.totalProducts} items`,
            chartData: summaryData.categoryBreakdown,
            chartColor: "#7367f0",
        },
        {
            title: "Products by Category",
            value: summaryData.categoryBreakdown[0]?.value || 0,
            subtitle: summaryData.categoryBreakdown[0]?.name || 'N/A',
            chartData: summaryData.categoryBreakdown,
            chartColor: "#7367f0",
            showChart: true,
        },
        {
            title: "Total Weight",
            value: `${summaryData.totalWeight.toFixed(2)}g`,
            subtitle: `Across ${summaryData.totalProducts} products`,
            chartData: summaryData.metalTypeBreakdown,
            chartColor: "#28c76f",
        },
        {
            title: "Products by Collection",
            value: summaryData.collectionBreakdown[0]?.value || 0,
            subtitle: summaryData.collectionBreakdown[0]?.name || 'N/A',
            chartData: summaryData.collectionBreakdown,
            chartColor: "#ff9f43",
            showChart: true,
        },
        {
            title: "Total Diamonds",
            value: summaryData.totalDiamonds,
            subtitle: `${summaryData.totalDiamonds} pieces`,
            chartData: summaryData.categoryBreakdown,
            chartColor: "#00cfe8",
        },
        {
            title: "Products by Metal",
            value: summaryData.metalTypeBreakdown[0]?.value || 0,
            subtitle: summaryData.metalTypeBreakdown[0]?.name || 'N/A',
            chartData: summaryData.metalTypeBreakdown,
            chartColor: "#ea5455",
            showChart: true,
        },
    ];

    return (
        <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
                {cards.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 2 }} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                                {/* Header */}
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.875rem', mb: 1 }}
                                >
                                    {card.title}
                                </Typography>

                                {/* Value */}
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 700, fontSize: '2rem', mb: 0.5 }}
                                >
                                    {card.value}
                                </Typography>

                                {/* Subtitle */}
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.75rem', display: 'block', mb: card.showChart ? 2 : 0 }}
                                >
                                    {card.subtitle}
                                </Typography>

                                {/* Chart */}
                                {card.showChart && card.chartData.length > 0 && (
                                    <Box sx={{ mt: 2, height: 60 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={card.chartData}>
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke={card.chartColor}
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ProductSummaryCards;

"use client";
import React, { useState } from 'react';
import { Box, Typography, Container, Card, CardContent, Grid, Button, Dialog, DialogTitle, DialogContent, IconButton, Slide, Accordion, AccordionSummary, AccordionDetails, GlobalStyles, Fade, CircularProgress } from '@mui/material';
import { ChevronDown, Layers, BadgeDollarSign, PackageSearch, Maximize, Minimize, X, ChevronLeft, ChevronRight, ArrowUpRight, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Mousewheel, Navigation, Virtual } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const VideoCard = ({ title, description, youtubeId, onClick, index }) => {
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
            onClick={onClick}
            sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: 1.58,
                borderRadius: '32px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    '& .video-overlay': {
                        bgcolor: 'rgba(0,0,0,0.2)'
                    }
                }
            }}
        >
            {/* Background Image */}
            <Box
                component="img"
                src={thumbnailUrl}
                alt={title}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />

            {/* Overlay Gradient */}
            <Box
                className="video-overlay"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
                    transition: 'background-color 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 3
                }}
            >
                {/* Top Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box
                        sx={{
                            bgcolor: 'white',
                            px: 2,
                            py: 0.75,
                            borderRadius: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'black' }}>
                            View video
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'black'
                        }}
                    >
                        <ArrowUpRight size={20} />
                    </Box>
                </Box>

                {/* Bottom Content */}
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            mb: 0.5,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            color: 'white',
                            fontWeight: 600,
                            lineHeight: 1.1,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            fontSize: { xs: '1.5rem', md: '1.75rem' }
                        }}
                    >
                        {description}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

const FeatureCard = ({ icon: Icon, title, description, color = "#7367f0", index, handleSearchFocus }) => (
    <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
        elevation={0}
        onClick={handleSearchFocus}
        sx={{
            width: '100%',
            height: '100%',
            aspectRatio: 1.58,
            borderRadius: '32px',
            border: '1px solid rgba(0,0,0,0.05)',
            bgcolor: 'white',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                borderColor: 'transparent',
                cursor: 'pointer',
            }
        }}
    >
        <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${color}10`,
                    color: color,
                    mb: 3,
                    transition: 'transform 0.3s ease',
                    '.MuiCard-root:hover &': {
                        transform: 'scale(1.1) rotate(-5deg)'
                    }
                }}
            >
                <Icon size={28} />
            </Box>

            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    color: 'text.primary',
                    fontSize: '1.25rem'
                }}
            >
                {title}
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                }}
            >
                {description}
            </Typography>

            <Box sx={{ mt: 'auto', pt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        transition: 'all 0.2s ease',
                        '.MuiCard-root:hover &': {
                            bgcolor: color,
                            color: 'white',
                            transform: 'rotate(45deg)'
                        }
                    }}
                >
                    <ArrowUpRight size={18} />
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const FeedbackSection = ({
    title = "Share Your Feedback",
    subtitle = "Tell us about your experience so we can improve the platform.",
    rating,
    feedback,
    submitted,
    maxRating = 5,
    isloading,
    onRatingChange,
    onFeedbackChange,
    onSubmit
}) => {

    return (
        <Box sx={{ position: 'relative', py: { xs: 8, md: 12 } }}>
            <Container maxWidth="md">

                {/* Header */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    sx={{ textAlign: "center", mb: 8 }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            mb: 2,
                            fontSize: { xs: "2rem", md: "3rem" },
                            fontWeight: 700,
                            color: "text.primary",
                            letterSpacing: '-0.02em',
                            lineHeight: 1
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: "1.1rem",
                            color: "text.secondary",
                            maxWidth: "700px",
                            mx: "auto",
                            lineHeight: 1.6
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Box>

                {/* Card */}
                <Card
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    elevation={0}
                    sx={{
                        borderRadius: "32px",
                        border: "1px solid rgba(0,0,0,0.05)",
                        bgcolor: 'white',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                            borderColor: 'transparent',
                        }
                    }}
                >
                    <CardContent sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        {/* Rating */}
                        <Box sx={{ display: "flex", gap: 1.5, mb: 4 }}>
                            {[...Array(maxRating)].map((_, index) => {
                                const starValue = index + 1;
                                return (
                                    <Box
                                        key={starValue}
                                        component={motion.div}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Star
                                            size={40}
                                            style={{
                                                cursor: "pointer",
                                                fill: rating >= starValue ? "#f59e0b" : "none",
                                                color: rating >= starValue ? "#f59e0b" : "#e1e1e1ff",
                                                transition: "all 0.2s ease"
                                            }}
                                            onClick={() => onRatingChange && onRatingChange(starValue)}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Feedback */}
                        <Box sx={{ width: '100%', mb: 4 }}>
                            <Box
                                component="textarea"
                                value={feedback}
                                onChange={(e) => onFeedbackChange && onFeedbackChange(e.target.value)}
                                placeholder="Tell us what you loved or what we could do better..."
                                style={{
                                    width: "100%",
                                    padding: "20px",
                                    borderRadius: "20px",
                                    border: "2px solid #f1f5f9",
                                    fontSize: "16px",
                                    resize: "none",
                                    outline: "none",
                                    transition: "all 0.3s ease",
                                    backgroundColor: "#fbfbfbff",
                                    fontFamily: 'inherit',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#7367f0';
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(115, 103, 240, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#f1f5f9';
                                    e.target.style.backgroundColor = '#f8fafc';
                                    e.target.style.boxShadow = 'none';
                                }}
                                rows={3}
                            />
                        </Box>

                        {/* Submit Button */}
                        <Button
                            variant="contained"
                            size="small"
                            component={motion.button}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onSubmit}
                            className="ai-feedback-btn"
                            disabled={isloading}
                            sx={{
                                padding: '10px 18px',
                                '.MuiButton-startIcon': {
                                    marginRight: isloading ? 1 : 0,
                                    transition: 'margin-right 200ms ease',
                                },
                            }}
                            startIcon={
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: isloading ? 16 : 0,
                                        opacity: isloading ? 1 : 0,
                                        overflow: 'hidden',
                                        transition: 'width 200ms ease, opacity 200ms ease',
                                    }}
                                >
                                    <CircularProgress size={16} color="inherit" />
                                </Box>
                            }
                        >
                            Submit Feedback
                        </Button>

                        {submitted && (
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                sx={{ mt: 3 }}
                            >
                                <Typography sx={{ color: "success.main", fontWeight: 500 }}>
                                    Thank you for your feedback! We appreciate your input.
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

const FAQAccordion = ({ question, answer }) => (
    <Accordion
        elevation={0}
        sx={{
            mb: 2,
            borderRadius: '16px !important',
            bgcolor: '#F9F8F6',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            '&:before': { display: 'none' },
            border: '1px solid transparent',
            '&.Mui-expanded': {
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
            }
        }}
    >
        <AccordionSummary expandIcon={<ChevronDown color="#94a3b8" />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{question}</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {answer}
            </Typography>
        </AccordionDetails>
    </Accordion>
);

const HowItWorks = ({ activeStep, onStepChange, handleSearchFocus }) => {
    const [activeVideo, setActiveVideo] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [swiperRef, setSwiperRef] = useState(null);
    const [isfeedbackloading, setIsFeedbackLoading] = useState(false);
    const [rating, setRating] = React.useState(0);
    const [feedback, setFeedback] = React.useState("");
    const [submitted, setSubmitted] = React.useState(false);

    // Sync external activeStep with internal activeVideo
    React.useEffect(() => {
        if (activeStep !== undefined && activeStep !== activeVideo) {
            handleStepClick(activeStep);
        }
    }, [activeStep]);

    // Sync Swiper with activeVideo state when modal is open
    React.useEffect(() => {
        if (modalOpen && swiperRef && swiperRef.activeIndex !== activeVideo) {
            swiperRef.slideTo(activeVideo);
        }
    }, [modalOpen, activeVideo, swiperRef]);

    const handleFullscreenClose = () => {
        setModalOpen(false);
    };

    const handleStepClick = (index) => {
        if (activeVideo === index && !isChanging) return;
        setIsChanging(true);
        setTimeout(() => {
            setActiveVideo(index);
            setIsPlaying(false);
            setIsChanging(false);
            if (onStepChange) onStepChange(index);
        }, 300);
    };

    const handleFeedbackSubmit = () => {
        setIsFeedbackLoading(true);
        console.log({ rating, feedback });
        setSubmitted(true);
        setRating(0);
        setFeedback("");
        setIsFeedbackLoading(false);
    };

    // Video guide steps
    const steps = [
        { title: "Search by Image", description: "Upload a jewelry image or describe your idea to find instant matches", youtubeId: "jXVzXa6T3gs" },
        { title: "Search by Text Prompt", description: "Use natural language prompts to discover products with precision", youtubeId: "y5lxSNUaK2Q" },
        { title: "Remove Background via Image Editor", description: "Clean up product images using the built-in background removal tool", youtubeId: "vdxHn4b2rKs" },
    ];

    const features = [
        { icon: PackageSearch, title: "Multimodal Search", description: "Search through your assets using text descriptions or reference images for instant discovery.", color: "#7367f0" },
        { icon: Layers, title: "Catalog Automation", description: "Organize albums and assets automatically with AI-driven tagging and categorization.", color: "#ea5455" },
        { icon: BadgeDollarSign, title: "Sales Workflow", description: "Convert searches directly into quotations and orders with automated workflow integrations.", color: "#00cfe8" },
    ];

    const faqs = [
        {
            question: "How does AI search work?",
            answer: "Our AI-powered search supports image-based search, text-based search, and combined image + text queries. You can upload a jewelry image, describe a design in natural language, or refine results using both. The system uses visual similarity matching and semantic search to return highly relevant results from the catalog."
        },
        {
            question: "Can I search within my local catalog?",
            answer: "Yes. The platform supports local catalog search, allowing you to search only within your uploaded inventory. You can filter results by collection, category, gender, style, design, and other structured attributes for precise discovery."
        },
        {
            question: "Can users create and manage albums?",
            answer: "Users can create custom albums to save and organize their favorite jewelry designs. Albums can be used for client presentations, internal references, or shortlisting items before placing orders or requesting quotes."
        },
        {
            question: "How do orders and quote requests work?",
            answer: "Users can directly place orders from selected catalog items or submit quote requests for custom or bulk requirements. The system tracks order status and quote approvals through a streamlined workflow."
        },
        {
            question: "Can I filter jewelry by specific attributes?",
            answer: "Yes. Advanced filtering options allow you to refine results by collection, category (rings, necklaces, etc.), gender, style, design type, and other metadata. This ensures fast and accurate product discovery across large inventories."
        }
    ];


    return (
        <Box sx={{ width: '100%', pt: 2, pb: 6 }}>
            <GlobalStyles
                styles={{
                    '@keyframes sectionPulse': {
                        '0%': {
                            boxShadow: '0 0 0 0 rgba(115, 103, 240, 0)',
                        },
                        '20%': {
                            boxShadow: '0 0 0 15px rgba(115, 103, 240, 0.15)',
                        },
                        '100%': {
                            boxShadow: '0 0 0 0 rgba(115, 103, 240, 0)',
                        },
                    },
                    '.section-highlight-active #video-player-container': {
                        animation: 'sectionPulse 1.5s ease-out 2',
                        border: '2px solid rgba(115, 103, 240, 0.5)',
                        zIndex: 10,
                    },
                    '.section-highlight-active': {
                        position: 'relative',
                    },
                    '@keyframes pulse': {
                        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                        '50%': { opacity: 0.5, transform: 'scale(0.85)' },
                    },
                }}
            />

            {/* --- 1. How It Works --- */}
            <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }} id="how-it-works-section">
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    sx={{ textAlign: 'center', mb: 8 }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            mb: 2,
                            fontSize: { xs: "2rem", md: "3rem" },
                            fontWeight: 700,
                            color: "text.primary",
                            letterSpacing: '-0.02em',
                            lineHeight: 1
                        }}
                    >
                        How it works?
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: "1.1rem",
                            color: "text.secondary",
                            maxWidth: "700px",
                            mx: "auto",
                            lineHeight: 1.6
                        }}
                    >
                        Step-by-step video guides to help you harness the full potential of Cloud AI catalog management and multimodal search capabilities.
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {steps.map((step, index) => (
                        <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
                            <VideoCard
                                {...step}
                                index={index}
                                onClick={() => {
                                    setActiveVideo(index);
                                    setModalOpen(true);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* Video Modal */}
                <Dialog
                    open={modalOpen}
                    TransitionComponent={Transition}
                    onClose={handleFullscreenClose}
                    maxWidth={isFullscreen ? false : "lg"}
                    fullWidth
                    fullScreen={isFullscreen}
                    PaperProps={{
                        sx: {
                            bgcolor: 'background.paper',
                            borderRadius: isFullscreen ? 0 : 3,
                            overflow: 'hidden',
                            maxWidth: isFullscreen ? '100%' : '1200px',
                            width: '100%',
                            height: isFullscreen ? '100%' : 'auto',
                            maxHeight: isFullscreen ? '100%' : '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            m: isFullscreen ? 0 : 2,
                            boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
                        }
                    }}
                    sx={{
                        '& .MuiDialog-container': {
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }}
                >
                    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                        <Typography component="span" variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary', mr: 2, fontSize: '1.25rem' }}>
                            {steps[activeVideo].title}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {/* Navigation Controls in Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton
                                    onClick={() => swiperRef?.slidePrev()}
                                    disabled={activeVideo === 0}
                                    size="small"
                                    sx={{
                                        color: 'text.secondary',
                                        opacity: activeVideo === 0 ? 0.3 : 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                                    }}
                                >
                                    <ChevronLeft size={18} />
                                </IconButton>

                                <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '40px', textAlign: 'center', color: 'text.secondary' }}>
                                    {activeVideo + 1} / {steps.length}
                                </Typography>

                                <IconButton
                                    onClick={() => swiperRef?.slideNext()}
                                    disabled={activeVideo === steps.length - 1}
                                    size="small"
                                    sx={{
                                        color: 'text.secondary',
                                        opacity: activeVideo === steps.length - 1 ? 0.3 : 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                                    }}
                                >
                                    <ChevronRight size={18} />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, borderLeft: '1px solid', borderColor: 'divider', pl: 2 }}>
                                <IconButton
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    size="small"
                                    sx={{ color: 'text.secondary', padding: 1 }}
                                >
                                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                </IconButton>
                                <IconButton onClick={handleFullscreenClose} sx={{ color: 'text.secondary', padding: 1 }}>
                                    <X size={20} />
                                </IconButton>
                            </Box>
                        </Box>
                    </DialogTitle>

                    <DialogContent sx={{ p: 0, bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexGrow: 1, aspectRatio: '16/9' }}>
                        <Swiper
                            modules={[Virtual, Keyboard, Mousewheel, Navigation]}
                            onSwiper={setSwiperRef}
                            spaceBetween={0}
                            slidesPerView={1}
                            keyboard={{ enabled: true }}
                            mousewheel={{ enabled: true }}
                            initialSlide={activeVideo}
                            onSlideChange={(swiper) => setActiveVideo(swiper.activeIndex)}
                            style={{ width: '100%', height: '100%' }}
                        >
                            {steps.map((step, index) => (
                                <SwiperSlide key={index}>
                                    <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${step.youtubeId}?rel=0&modestbranding=1${index === activeVideo ? '&autoplay=1' : ''}`}
                                            title={step.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                            style={{ display: 'block', width: '100%', height: '100%', border: 'none' }}
                                        />
                                    </Box>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </DialogContent>


                </Dialog>
            </Container>

            {/* --- 2. Empowering Your Enterprise --- */}
            <Box sx={{ position: 'relative', py: { xs: 8, md: 12 }, background: "#F9F8F6" }}>
                <Container maxWidth="xl">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                mb: 2,
                                fontSize: { xs: "2rem", md: "3rem" },
                                fontWeight: 700,
                                color: "text.primary",
                                letterSpacing: '-0.02em',
                                lineHeight: 1
                            }}
                        >
                            Empowering Your Enterprise
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: "1.1rem",
                                color: "text.secondary",
                                maxWidth: "700px",
                                mx: "auto",
                                lineHeight: 1.6
                            }}
                        >
                            Everything you need to modernize your business intelligence in one platform.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
                                <FeatureCard {...feature} index={index} handleSearchFocus={handleSearchFocus} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            <FeedbackSection
                rating={rating}
                feedback={feedback}
                submitted={submitted}
                isloading={isfeedbackloading}
                onRatingChange={setRating}
                onFeedbackChange={setFeedback}
                onSubmit={handleFeedbackSubmit}
                title="Share Your Feedback"
                subtitle="Tell us about your experience so we can improve the platform."
                maxRating={5}
            />

            {/* --- 3. FAQ --- */}
            <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#334155' }}>
                        Common Questions
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {faqs.map((faq, index) => (
                        <FAQAccordion key={index} {...faq} />
                    ))}
                </Box>
            </Container>

        </Box>
    );
};

export default HowItWorks;

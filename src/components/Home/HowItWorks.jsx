"use client";
import React, { useState } from 'react';
import { Box, Typography, Container, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Slide, Accordion, AccordionSummary, AccordionDetails, GlobalStyles, Fade } from '@mui/material';
import { ChevronDown, Layers, Play, BadgeDollarSign, PackageSearch, Maximize, Minimize, X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Mousewheel, Navigation, Virtual } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SectionHeader = ({ title, subtitle, align = "left" }) => (
    <Box sx={{ mb: 2, textAlign: align }}>
        {title && (
            <Typography
                variant="h2"
                sx={{
                    mb: 1,
                    fontSize: { xs: "1.25rem", md: "2rem" },
                    fontWeight: 700,
                    color: "text.primary"
                }}
            >
                {title}
            </Typography>
        )}
        {subtitle && (
            <Typography
                variant="body1"
                sx={{
                    fontSize: "0.9rem",
                    color: "text.secondary",
                    mx: align === "center" ? "auto" : 0,
                    lineHeight: 1.6
                }}
            >
                {subtitle}
            </Typography>
        )}
    </Box>
);

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
                aspectRatio: '5/4',
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

const FeatureCard = ({ icon: Icon, title, description, color = "#7367f0", index }) => (
    <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
        elevation={0}
        sx={{
            width: '100%',
            height: '100%',
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

const HowItWorks = ({ activeStep, onStepChange }) => {
    const [activeVideo, setActiveVideo] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const videoRef = React.useRef(null);
    const [swiperRef, setSwiperRef] = useState(null);

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

    const handlePlayClick = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleFullscreenOpen = (e) => {
        e.stopPropagation(); // Prevent play toggle if clicking fullscreen
        setModalOpen(true);
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

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
        <Box sx={{ width: '100%', py: 3 }}>
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
            <Container maxWidth="xl" sx={{ mb: 16 }} id="how-it-works-section">
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
                            my: 2,
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
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
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
                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mr: 2 }}>
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
            <Box sx={{ position: 'relative', py: 12, mb: 12, background: "#F9F8F6" }}>
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
                                <FeatureCard {...feature} index={index} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* --- 3. FAQ --- */}
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.5, mb: 1, display: 'block', textTransform: 'uppercase' }}>
                        FAQ
                    </Typography>
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

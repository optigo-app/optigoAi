"use client";
import React, { useState } from 'react';
import { Box, Typography, Container, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Slide, Accordion, AccordionSummary, AccordionDetails, GlobalStyles } from '@mui/material';
import { ChevronDown, Layers, Play, BadgeDollarSign, PackageSearch, Maximize, Minimize, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Mousewheel, Navigation, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SectionHeader = ({ title, subtitle, align = "left" }) => (
    <Box sx={{ mb: 6, textAlign: align }}>
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
                    maxWidth: '39%',
                    mx: align === "center" ? "auto" : 0,
                    lineHeight: 1.6
                }}
            >
                {subtitle}
            </Typography>
        )}
    </Box>
);

const VideoListItem = ({ title, description, active, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            p: 3,
            borderRadius: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: active ? '1px solid #7367f0' : '1px solid transparent',
            bgcolor: active ? 'rgba(115, 103, 240, 0.08)' : 'transparent',
            maxWidth: 600,
            width: '100%',
            '&:hover': {
                bgcolor: active ? 'rgba(115, 103, 240, 0.12)' : 'rgba(0,0,0,0.02)',
                transform: active ? 'none' : 'translateX(10px)'
            }
        }}
    >
        {/* Icon / Indicator */}
        <Box
            sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: active ? 'rgba(115, 103, 240, 0.2)' : 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: active ? '#7367f0' : '#94a3b8'
            }}
        >
            {active ? <Play size={24} fill="currentColor" /> : <Box sx={{ width: 24, height: 2, bgcolor: 'currentColor', borderRadius: 1 }} />}
        </Box>

        {/* Text Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {active && (
                <Typography variant="caption" sx={{ color: '#7367f0', fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Active
                </Typography>
            )}
            <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2, mb: 0.5, color: active ? 'text.primary' : 'text.secondary' }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                {description}
            </Typography>
        </Box>
    </Box>
);

const FeatureCard = ({ icon: Icon, title, description, color = "#7367f0" }) => (
    <Card
        elevation={0}
        sx={{
            width: '100%',
            maxWidth: 800,
            mx: 'auto',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.6)',
            background: 'rgba(255, 255, 255, 0.3)', // Glassmorphism
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            overflow: 'visible',
            position: 'relative',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                background: 'rgba(255, 255, 255, 0.5)',
                borderColor: 'rgba(255,255,255,0.8)'
            }
        }}
    >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${color}15`,
                    color: color,
                    flexShrink: 0,
                    mb: 2
                }}
            >
                <Icon size={32} />
            </Box>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, mt: 1.5 }}>
                    {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {description}
                </Typography>
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

    // Mock video paths - cycling through available videos
    const steps = [
        { title: "Search by Text & Image", description: "Multimodal search guide", active: true, video: "/videos/1.mp4" },
        { title: "Managing Your Catalog & Albums", description: "Asset organization utility", active: false, video: "/videos/2.mp4" },
        { title: "Generating Quotations & Orders", description: "Sales workflow automation", active: false, video: "/videos/3.mp4" },
        { title: "Advanced Enterprise Features", description: "Scaling for large teams", active: false, video: "/videos/4.mp4" },
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
                    }
                }}
            />

            {/* --- 1. How It Works --- */}
            <Container maxWidth={false} sx={{ mb: 16 }} id="how-it-works-section">
                <SectionHeader
                    title="How it works?"
                    subtitle="Step-by-step video guides to help you harness the full potential of Cloud AI's catalog management and multimodal search capabilities."
                />

                <Grid container spacing={4}>
                    {/* Left Column (Video Player) */}
                    <Grid size={{ xs: 12, md: 8, lg: 8 }}>
                        <Box
                            id="video-player-container"
                            sx={{
                                width: '100%',
                                aspectRatio: '16/9',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                bgcolor: '#000',
                                position: 'relative',
                                transition: 'all 0.5s ease',
                                '&:hover .fullscreen-btn': { opacity: 1 }
                            }}
                        >
                            <video
                                ref={videoRef}
                                key={activeVideo}
                                src={steps[activeVideo].video}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    opacity: isChanging ? 0 : 1,
                                    transition: 'opacity 0.3s ease-in-out'
                                }}
                                controls={isPlaying}
                                playsInline
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)}
                            />

                            {/* Overlay (Visible when not playing) */}
                            {!isPlaying && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        bgcolor: 'rgba(0,0,0,0.4)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={handlePlayClick}
                                >
                                    {/* Play Button */}
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 4,
                                            transition: 'transform 0.2s ease',
                                            '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(255,255,255,0.3)' }
                                        }}
                                    >
                                        <Play size={40} fill="white" color="white" style={{ marginLeft: 4 }} />
                                    </Box>

                                    {/* Bottom Info Overlay */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                            p: 4,
                                            pt: 8
                                        }}
                                    >
                                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                                            {steps[activeVideo].title}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                            {steps[activeVideo].description}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Fullscreen Button */}
                            <IconButton
                                className="fullscreen-btn"
                                onClick={handleFullscreenOpen}
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                                }}
                            >
                                <Maximize size={20} />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Right List (80%) */}
                    <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.875rem', fontWeight: 700, letterSpacing: 1 }}>
                                Guide Library
                            </Typography>
                            {steps.map((step, index) => (
                                <VideoListItem
                                    key={index}
                                    {...step}
                                    active={activeVideo === index}
                                    onClick={() => handleStepClick(index)}
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                {/* Video Modal */}
                <Dialog
                    open={modalOpen}
                    TransitionComponent={Transition}
                    onClose={handleFullscreenClose}
                    maxWidth={isFullscreen ? false : "xl"}
                    fullWidth
                    fullScreen={isFullscreen}
                    PaperProps={{
                        sx: {
                            bgcolor: 'black',
                            borderRadius: isFullscreen ? 0 : '16px',
                            overflow: 'hidden',
                            maxWidth: isFullscreen ? '100%' : '1200px',
                            height: isFullscreen ? '100%' : 'auto',
                            maxHeight: isFullscreen ? '100%' : '90vh',
                            m: isFullscreen ? 0 : 2
                        }
                    }}
                    sx={{
                        '& .MuiDialog-container': {
                            height: isFullscreen ? '100%' : '100%',
                        }
                    }}
                >
                    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a1a1a', borderBottom: '1px solid #333' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', mr: 2 }}>
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
                                        color: 'white',
                                        opacity: activeVideo === 0 ? 0.3 : 1,
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    <ChevronLeft size={18} />
                                </IconButton>

                                <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                    {activeVideo + 1} / {steps.length}
                                </Typography>

                                <IconButton
                                    onClick={() => swiperRef?.slideNext()}
                                    disabled={activeVideo === steps.length - 1}
                                    size="small"
                                    sx={{
                                        color: 'white',
                                        opacity: activeVideo === steps.length - 1 ? 0.3 : 1,
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    <ChevronRight size={18} />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', pl: 2 }}>
                                <IconButton
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    size="small"
                                    sx={{ color: 'grey.500', padding: 1 }}
                                >
                                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                </IconButton>
                                <IconButton onClick={handleFullscreenClose} sx={{ color: 'grey.500', padding: 1 }}>
                                    <X size={20} />
                                </IconButton>
                            </Box>
                        </Box>
                    </DialogTitle>

                    <DialogContent sx={{ p: 0, bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
                                        <video
                                            width="100%"
                                            height="100%"
                                            controls
                                            autoPlay={index === activeVideo} // Only autoplay active slide
                                            src={step.video}
                                            style={{ display: 'block', maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '80vh' }}
                                        />
                                    </Box>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </DialogContent>


                </Dialog>
            </Container>

            {/* --- 2. Empowering Your Enterprise --- */}
            <Box sx={{ position: 'relative', py: 10, mb: 12, background: "#F9F8F6" }}>
                {/* Background Waves (Simulated with CSS for now, assuming GridBackground in parent handles global bg, but we need specific section bg) */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: -1,
                        background: 'radial-gradient(circle at 50% 50%, rgba(115, 103, 240, 0.15), transparent 70%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                >
                    {/* Can add SVGs or more complex gradients here if needed to match the 'wave' look exactly */}
                </Box>

                <Container maxWidth={false}>
                    <SectionHeader
                        title="Empowering Your Enterprise"
                        subtitle="Everything you need to modernize your business intelligence in one platform."
                        align="center"
                    />

                    <Grid container spacing={3}>
                        {features.map((feature, index) => (
                            <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
                                <FeatureCard {...feature} />
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

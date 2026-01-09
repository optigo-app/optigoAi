import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Grid,
    Box,
    Typography,
    CircularProgress,
    Button,
    Skeleton,
    Popover,
    Stack,
    TextField,
    Tooltip
} from '@mui/material';
import { X, SearchX, ArrowLeft, ArrowRight, Minimize, Maximize, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import ProductCard from './ProductCard';
import ImageHoverPreview from '@/components/Common/ImageHoverPreview';
import { searchService } from '@/services/apiService';
import { uploadService } from '@/services/uploadService';
import { getMatchedDesignCollections, compressImagesToWebP } from '@/utils/globalFunc';
import { saveAiSearchFeedbackApi } from '@/app/api/saveAiSearchFeedbackApi';
import useCustomToast from '@/hook/useCustomToast';
import { motion, AnimatePresence } from 'framer-motion';

export default function SimilarProductsModal({ open, onClose, baseProduct, allProducts, onSearchSimilar, onBack, onForward, canGoBack, canGoForward }) {
    const [loading, setLoading] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [error, setError] = useState(null);
    const [showContent, setShowContent] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [slideDirection, setSlideDirection] = useState('none'); // 'left', 'right', or 'none'
    const [isNavigating, setIsNavigating] = useState(false);
    const { showSuccess, showError } = useCustomToast();

    // Feedback States
    const [likedIds, setLikedIds] = useState([]);
    const [dislikedIds, setDislikedIds] = useState([]);
    const [sentIds, setSentIds] = useState([]);
    const [feedbackIds, setFeedbackIds] = useState({});
    const [reasonMenuAnchor, setReasonMenuAnchor] = useState(null);
    const [activeReasonItem, setActiveReasonItem] = useState(null);
    const [isReporting, setIsReporting] = useState(false);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [commentText, setCommentText] = useState('');

    const DISLIKE_REASONS = [
        "Not relevant to search",
        "Inaccurate results",
        "Poor visual quality",
        "Too generic",
        "Other"
    ];

    const searchCacheRef = useRef({});

    useEffect(() => {
        if (open && baseProduct) {
            setShowContent(false);

            setTimeout(() => {
                fetchSimilarProducts();
                setShowContent(true);
            }, 50);
        }
    }, [open, baseProduct]);

    const fetchSimilarProducts = useCallback(async (forceFresh = false) => {
        if (!baseProduct) return;

        const imageUrl = baseProduct.originalUrl || baseProduct.image || baseProduct.thumbUrl;
        if (!imageUrl) {
            setError("No image available for this product.");
            return;
        }
        const cacheKey = baseProduct.id || baseProduct.designno;

        // Check if cached and not forcing fresh search
        if (searchCacheRef.current[cacheKey] && !forceFresh) {
            setSimilarProducts(searchCacheRef.current[cacheKey]);
            setIsNavigating(false);
            return;
        }

        setLoading(true);
        setError(null);
        setSimilarProducts([]);

        try {
            const imageUrl = baseProduct.originalUrl || baseProduct.image || baseProduct.thumbUrl;
            const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch image: ${response.status}`);
            }

            const blob = await response.blob();
            if (blob.size === 0) throw new Error('Downloaded image is empty');

            let fileType = response.headers.get('content-type') || blob.type;
            if (!fileType || fileType === 'application/octet-stream') {
                const urlLower = imageUrl.toLowerCase();
                if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) fileType = 'image/jpeg';
                else if (urlLower.includes('.png')) fileType = 'image/png';
                else if (urlLower.includes('.webp')) fileType = 'image/webp';
                else fileType = 'image/jpeg';
            }

            const file = new File([blob], `${baseProduct.sku || baseProduct.id}-search.jpg`, { type: fileType });
            const searchAccuracy = sessionStorage.getItem("searchAccuracy");
            const searchNumResults = sessionStorage.getItem("searchNumResults");
            const options = {
                top_k: searchNumResults || 200,
                min_percent: searchAccuracy || 40
            };
            const results = await searchService.searchByImage(file, options);
            const matched = getMatchedDesignCollections(results || [], allProducts);

            const filteredMatched = matched.filter(p => p.id !== baseProduct.id);

            // Store in cache
            searchCacheRef.current[cacheKey] = filteredMatched;
            setSimilarProducts(filteredMatched);

        } catch (err) {
            console.error('Similar search failed:', err);
            setError(err.message || 'Failed to load similar products.');
            setSimilarProducts([]);
        } finally {
            setLoading(false);
            setIsNavigating(false);
        }
    }, [baseProduct, allProducts, isNavigating]);

    // Reset feedback when base product changes
    useEffect(() => {
        setLikedIds([]);
        setDislikedIds([]);
        setSentIds([]);
        setFeedbackIds({});
    }, [baseProduct?.id]);

    const handleFeedback = async (item, isLiked, comment = "") => {
        const currentlyLiked = likedIds.includes(item.id);
        const currentlyDisliked = dislikedIds.includes(item.id);

        let isRemoval = false;
        if (!comment) {
            if ((isLiked === "1" && currentlyLiked) || (isLiked === "0" && currentlyDisliked)) {
                isRemoval = true;
            }
        }

        if (isRemoval) {
            setLikedIds(prev => prev.filter(id => id !== item.id));
            setDislikedIds(prev => prev.filter(id => id !== item.id));
        } else if (isLiked === "1") {
            setLikedIds(prev => [...prev.filter(id => id !== item.id), item.id]);
            setDislikedIds(prev => prev.filter(id => id !== item.id));
        } else if (isLiked === "0") {
            setDislikedIds(prev => [...prev.filter(id => id !== item.id), item.id]);
            setLikedIds(prev => prev.filter(id => id !== item.id));
        }

        setIsReporting(true);
        const feedbackKey = `${item.id}-${isLiked}-${comment}${isRemoval ? '-remove' : ''}`;
        if (sentIds.includes(feedbackKey)) {
            setIsReporting(false);
            return;
        }

        try {
            let imageUrl = "";
            let imageFileName = "";

            if (!isRemoval && item.imageUrl) {
                const storedUKey = typeof window !== 'undefined' ? sessionStorage.getItem('ukey') : null;
                // Use proxy to avoid CORS errors
                const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(item.imageUrl)}`;
                const response = await fetch(proxyUrl);
                const blob = await response.blob();
                const file = new File([blob], "similar-search.webp", { type: "image/webp" });

                const compressed = await compressImagesToWebP(file);
                if (compressed && compressed.length > 0) {
                    const uploadResult = await uploadService.uploadFile(
                        compressed[0].blob,
                        'AiSearch',
                        storedUKey || undefined
                    );

                    if (uploadResult && uploadResult.url) {
                        imageUrl = uploadResult.fileName;
                        imageFileName = uploadResult.name || uploadResult.fileName || "";
                    }
                }
            }

            const response = await saveAiSearchFeedbackApi({
                EventName: "SimilarSearch",
                SearchText: `Visual match for: ${item.name}`,
                ImageUrl: imageUrl,
                FileName: imageFileName,
                IsLiked: isRemoval ? (currentlyLiked ? "1" : "0") : isLiked,
                FeedbackID: feedbackIds[item.id] || "",
                Comment: comment,
                RemoveFeedback: isRemoval
            });

            if (response && response?.rd?.[0]?.FeedbackID) {
                setFeedbackIds(prev => ({ ...prev, [item.id]: response.rd[0].FeedbackID }));
            }

            if (isRemoval) {
                setFeedbackIds(prev => {
                    const next = { ...prev };
                    delete next[item.id];
                    return next;
                });
                setSentIds(prev => prev.filter(key => !key.startsWith(`${item.id}-`)));
            } else {
                setSentIds(prev => [...prev.filter(key => !key.startsWith(`${item.id}-`)), feedbackKey]);
            }

            if (comment) {
                showSuccess("Thank you for your feedback!");
                handleCloseReasonMenu();
            }
        } catch (error) {
            console.error("Error reporting feedback:", error);
            showError("Failed to report feedback.");
        } finally {
            setIsReporting(false);
        }
    };

    const handleOpenReasonMenu = (event, item) => {
        setReasonMenuAnchor(event.currentTarget);
        setActiveReasonItem(item);
        setShowOtherInput(false);
        setCommentText('');
    };

    const handleCloseReasonMenu = () => {
        setReasonMenuAnchor(null);
        setActiveReasonItem(null);
        setShowOtherInput(false);
        setCommentText('');
    };

    const handleSelectReason = (reason) => {
        if (reason === "Other") setShowOtherInput(true);
        else {
            handleFeedback(activeReasonItem, "0", reason);
            handleCloseReasonMenu();
        }
    };

    const submitComment = () => {
        if (!commentText.trim()) return;
        handleFeedback(activeReasonItem, "0", commentText);
        handleCloseReasonMenu();
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth={isFullscreen ? false : "lg"}
                fullWidth
                fullScreen={isFullscreen}
                PaperProps={{
                    sx: {
                        height: isFullscreen ? '100%' : 'calc(90vh - 70px)',
                        maxHeight: isFullscreen ? '100%' : 'calc(90vh - 70px)',
                        borderRadius: isFullscreen ? 0 : 3,
                        m: isFullscreen ? 0 : 2
                    }
                }}
                sx={{
                    '& .MuiDialog-container': {
                        height: isFullscreen ? '100%' : '94%',
                        maxHeight: isFullscreen ? '100%' : '94%'
                    }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                onClick={() => {
                                    setIsNavigating(true);
                                    setSlideDirection('right');
                                    setShowContent(false);
                                    setTimeout(() => {
                                        onBack();
                                    }, 200);
                                }}
                                disabled={!canGoBack}
                                size="small"
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    opacity: canGoBack ? 1 : 0.3,
                                    pointerEvents: canGoBack ? 'auto' : 'none'
                                }}
                            >
                                <ArrowLeft size={18} />
                            </IconButton>
                            <IconButton
                                onClick={() => {
                                    setIsNavigating(true);
                                    setSlideDirection('left');
                                    setShowContent(false);
                                    setTimeout(() => {
                                        onForward();
                                    }, 200);
                                }}
                                disabled={!canGoForward}
                                size="small"
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    mr: 1,
                                    opacity: canGoForward ? 1 : 0.3,
                                    pointerEvents: canGoForward ? 'auto' : 'none'
                                }}
                            >
                                <ArrowRight size={18} />
                            </IconButton>
                        </Box>
                        <Typography variant="h6" fontWeight="bold">Similar Products</Typography>
                        {baseProduct && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <ImageHoverPreview
                                    imageSrc={baseProduct.originalUrl || baseProduct.image || baseProduct.thumbUrl}
                                    altText="Base Large"
                                    triggerMode="hover"
                                >
                                    <Box
                                        component="img"
                                        src={baseProduct.thumbUrl || baseProduct.image || baseProduct.originalUrl}
                                        alt="Base"
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 1,
                                            objectFit: 'cover',
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.15)',
                                                boxShadow: 4
                                            }
                                        }}
                                    />
                                </ImageHoverPreview>
                                <Typography variant="body2" color="text.secondary">
                                    Based on: {baseProduct.designno}
                                </Typography>

                                {/* Like/Dislike Buttons */}
                                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                                    {['1', '0'].map((type) => {
                                        const isLiked = type === '1';
                                        const item = {
                                            id: `similar-${baseProduct.id}`,
                                            name: baseProduct.designno,
                                            imageUrl: baseProduct.originalUrl || baseProduct.image || baseProduct.thumbUrl
                                        };
                                        const active = isLiked ? likedIds.includes(item.id) : dislikedIds.includes(item.id);
                                        const color = isLiked ? 'success.main' : 'error.main';
                                        const Icon = isLiked ? ThumbsUp : ThumbsDown;
                                        const tooltip = isLiked ? (active ? "Liked visual matches" : "Like results") : (active ? "Disliked visual matches" : "Dislike results");

                                        return (
                                            <Tooltip key={type} title={tooltip}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isLiked) handleFeedback(item, type);
                                                        else {
                                                            if (active) handleFeedback(item, type);
                                                            else handleOpenReasonMenu(e, item);
                                                        }
                                                    }}
                                                    sx={{
                                                        p: '4px',
                                                        width: 26,
                                                        height: 26,
                                                        bgcolor: active ? color : 'rgba(0, 0, 0, 0.04)',
                                                        color: active ? 'white' : 'text.secondary',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            bgcolor: active ? color : 'rgba(0, 0, 0, 0.08)',
                                                            transform: 'scale(1.1)',
                                                        },
                                                        '&:active': { transform: 'scale(0.95)' },
                                                    }}
                                                >
                                                    <Icon size={14} style={{ strokeWidth: active ? 2.5 : 2 }} />
                                                </IconButton>
                                            </Tooltip>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* <Button
                            size="small"
                            variant="outlined"
                            onClick={() => fetchSimilarProducts(true)}
                            sx={{ minWidth: 'auto', py: 0, px: 2, mr: 1, textTransform: 'none', borderRadius: 1 }}
                        >
                            Refresh
                        </Button> */}
                        <IconButton
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            size="small"
                            sx={{ color: theme => theme.palette.grey[500], padding: 1 }}
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </IconButton>
                        <IconButton onClick={onClose} sx={{ color: theme => theme.palette.grey[500], padding: 1 }}>
                            <X size={20} />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3, bgcolor: '#f9f9fa' }}>
                    {!showContent ? (
                        <Grid container spacing={2}>
                            {[...Array(isFullscreen ? 12 : 8)].map((_, index) => (
                                <Grid
                                    key={`skeleton-${index}`}
                                    size={{
                                        xs: 6,
                                        sm: 4,
                                        md: 3,
                                        lg: isFullscreen ? 2 : 3,
                                        xl: isFullscreen ? 2 : 3,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            bgcolor: 'white',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            animation: 'fadeIn 0.3s ease-in',
                                            animationDelay: `${index * 0.03}s`,
                                            animationFillMode: 'backwards',
                                            '@keyframes fadeIn': {
                                                from: {
                                                    opacity: 0,
                                                    transform: 'translateY(10px)',
                                                },
                                                to: {
                                                    opacity: 1,
                                                    transform: 'translateY(0)',
                                                },
                                            },
                                        }}
                                    >
                                        <Skeleton
                                            variant="rectangular"
                                            width="100%"
                                            height={280}
                                            animation="wave"
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    ) : loading && !isNavigating ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
                            <CircularProgress size={40} sx={{ mb: 2 }} />
                            <Typography color="text.secondary">Finding visual matches...</Typography>
                        </Box>
                    ) : error ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
                            <Typography color="error">{error}</Typography>
                            <Button onClick={fetchSimilarProducts} sx={{ mt: 2 }}>Try Again</Button>
                        </Box>
                    ) : similarProducts.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
                            <SearchX size={60} color="#9e9e9e" />
                            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>No similar products found</Typography>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                opacity: showContent ? 1 : 0,
                                transform: showContent
                                    ? 'translateX(0) scale(1)'
                                    : slideDirection === 'left'
                                        ? 'translateX(30px) scale(0.95)'
                                        : slideDirection === 'right'
                                            ? 'translateX(-30px) scale(0.95)'
                                            : 'translateY(20px) scale(0.95)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <Grid container spacing={2}>
                                {similarProducts.map((product, index) => (
                                    <Grid
                                        key={`${product.id}-${index}`}
                                        size={{
                                            xs: 6,
                                            sm: 4,
                                            md: 3,
                                            lg: isFullscreen ? 2 : 3,
                                            xl: isFullscreen ? 2 : 3,
                                        }}>
                                        <ProductCard
                                            product={product}
                                            products={similarProducts}
                                            index={index}
                                            onSearchSimilar={onSearchSimilar}
                                            showSimilarButton={true}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cache Detection Dialog */}

            {/* Dislike Reason Menu */}
            <Popover
                open={Boolean(reasonMenuAnchor)}
                anchorEl={reasonMenuAnchor}
                onClose={handleCloseReasonMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        width: 240,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        p: 1.5,
                        transition: 'all 0.3s ease'
                    }
                }}
            >
                <Typography variant="overline" sx={{ px: 1, py: 0.5, opacity: 0.6, display: 'block', fontWeight: 700, color: 'error.main' }}>
                    Why this result?
                </Typography>
                <Stack spacing={0.5}>
                    {!showOtherInput ? (
                        DISLIKE_REASONS.map((reason) => (
                            <Button
                                key={reason}
                                onClick={() => handleSelectReason(reason)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    color: 'text.primary',
                                    fontSize: '0.8rem',
                                    py: 1,
                                    px: 1.5,
                                    borderRadius: 1.5,
                                    fontWeight: 500,
                                    '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.04)',
                                        color: 'error.main'
                                    }
                                }}
                            >
                                {reason}
                            </Button>
                        ))
                    ) : (
                        <Box sx={{ p: 0.5 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Tell us more..."
                                size="small"
                                autoFocus
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value.slice(0, 300))}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.8rem',
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                        '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                                    }
                                }}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                <Button
                                    fullWidth
                                    size="small"
                                    onClick={() => setShowOtherInput(false)}
                                    sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                                >
                                    Back
                                </Button>
                                <Button
                                    fullWidth
                                    size="small"
                                    variant="contained"
                                    disabled={!commentText.trim() || isReporting}
                                    onClick={submitComment}
                                >
                                    {isReporting ? <CircularProgress size={12} color="inherit" thickness={5} /> : 'Submit'}
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Popover>

        </>
    );
}


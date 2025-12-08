'use client';
import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { ContinuousTypewriter, fileToBase64 } from '@/utils/globalFunc';
import ModernSearchBar from './ModernSearchBar';
import InfiniteImageStrip from './InfiniteImageStrip';
import { Fireflies } from './animation/Fireflies';
import { MouseOrbs } from './animation/MouseOrbs';
import { ModeSwitch } from './Common/HomeCommon';
import { GradientWaves } from './animation/GradientWaves';

export default function Home1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showInfo } = useToast();
  const [selectedMode, setSelectedMode] = useState("design");

  if (searchParams.get('FE')) return null;

  const handleSearch = async (searchData) => {
    let imageBase64 = null;
    if (searchData.image instanceof File) imageBase64 = await fileToBase64(searchData.image);

    const payload = { ...searchData, image: imageBase64, mode: 'design', timestamp: Date.now() };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    if (typeof window !== 'undefined') window.sessionStorage.setItem('homeSearchData', encoded);

    router.push('/product');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: '#f5f5f6',
      display: 'flex',
      flexDirection: 'column',
      color: '#111'
    }}>
      {/* Interactive Background */}
      {/* <Fireflies count={50} /> */}
      {/* <MouseOrbs count={15} /> */}
      {/* <GradientWaves /> */}

      {/* Soft blurred shapes */}
      <Box sx={{ position: 'absolute', width: 180, height: 180, top: '15%', left: '10%', background: 'rgba(180,180,200,0.15)', filter: 'blur(80px)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', width: 200, height: 200, bottom: '12%', right: '8%', background: 'rgba(200,180,200,0.15)', filter: 'blur(80px)', borderRadius: '50%' }} />

      {/* Hero Content */}
      <Container maxWidth="md" sx={{ flex: 1, zIndex: 2, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pt: { xs: 12, md: 6.3 } }}>
        {/* Logo */}
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
          <Image src="/icons/base-icon.svg" alt="Hero Logo" width={60} height={60} style={{ marginBottom: 82 }} />
        </motion.div>
        {/* Mode Selection Pill */}
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
          <ModeSwitch selectedMode={selectedMode} onSelect={setSelectedMode} />
        </motion.div>
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography
            variant="h1"
            fontWeight="600"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
              mb: 1.5,
              letterSpacing: "-1px",
              lineHeight: 1.1,
              color: "#475569",
              opacity: 0.9,
            }}
          >
            Jewelry That Captures the Moment
          </Typography>
        </motion.div>

        {/* Subtitle Typewriter */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <Typography variant="h6" sx={{ color: '#6B5FA3', mb: 3, fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' }, minHeight: '28px' }}>
            <ContinuousTypewriter texts={[
              "Find designs instantly…",
              "Upload a reference image — see matches…",
              "Explore your full design collection…",
            ]} />
          </Typography>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} style={{ width: '100%' }}>
          <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 2, mb: 10 }}>
            <ModernSearchBar onSubmit={handleSearch} appliedFilters={[]} initialExpanded alwaysExpanded />
          </Box>
        </motion.div>
      </Container>

      {/* Moving Image Strip */}
      <Box sx={{ zIndex: 1 }}>
        <InfiniteImageStrip direction="left" speed="slow" />
        <InfiniteImageStrip direction="right" speed="fast" />
      </Box>
    </Box>
  );
}

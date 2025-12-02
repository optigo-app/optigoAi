'use client';
import React from 'react';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import InfiniteImageStrip from './InfiniteImageStrip';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Cookies from 'js-cookie';

function HeroImageStrips() {
  return (
    <Box>
      <InfiniteImageStrip direction="left" speed="slow" />
      <InfiniteImageStrip direction="right" speed="fast" />
    </Box>
  );
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showInfo } = useToast();

  if (searchParams.get('FE')) {
    return null;
  }

  const handleGetStarted = () => {
    const skey = Cookies.get('skey');
    if (skey) {
      router.push('/product');
    } else if (typeof window !== 'undefined' && window.sessionStorage.getItem('optigo-auth') === 'true') {
      router.push('/product');
    } else {
      router.push('/authenticate');
    }
  };

  const handleGetHelp = () => {
    showInfo('Help Page Coming Soon...');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => theme.palette.background.default,
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pt: { xs: 10, md: 3 },
          pb: { xs: 6, md: 5 },
        }}
      >
        <Image
          src="/icons/base-icon.svg"
          alt="Hero Image"
          width={100}
          height={100}
          style={{
            maxWidth: '100%',
            height: 'auto',
            marginBottom: 2,
          }}
        />
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 600,
            letterSpacing: { xs: 0.2, md: 0.4 },
            mb: 2,
          }}
        >
          Advanced Generative AI
          <br />
          for Jewelry Designers
        </Typography>

        <Typography
          variant="h6"
          sx={{
            maxWidth: 600,
            mx: 'auto',
            mb: 4,
            color: 'text.secondary',
          }}
        >
          Helping designers create unique designs, visuals, and product content quickly from ideas.
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            mb: 6,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 600,
              background: (theme) => theme.palette.primary.main,
              boxShadow: '0 8px 22px rgba(115,103,240,0.35)',
              '&:hover': {
                boxShadow: '0 10px 28px rgba(115,103,240,0.5)',
              },
            }}
            onClick={handleGetStarted}
          >
            Get Started
          </Button>

          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'rgba(0,0,0,0.15)',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'rgba(0,0,0,0.25)',
                backgroundColor: 'rgba(0,0,0,0.03)',
              },
            }}
            onClick={handleGetHelp}
          >
            Get Help
          </Button>
        </Stack>
      </Container>
      <HeroImageStrips />
    </Box>
  );
}
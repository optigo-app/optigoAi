'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Fab, Zoom } from '@mui/material';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = React.memo(function ScrollToTop({
  threshold = 100,
  smooth = true,
  bottom = 24,
  right = 24,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [smooth]);

  return (
    <Zoom in={isVisible} timeout={300}>
      <Fab
        onClick={scrollToTop}
        size="medium"
        aria-label="scroll to top"
        sx={{
          position: 'fixed',
          bottom: bottom,
          right: right,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #7367f0, #6c5ce7)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(115, 103, 240, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6c5ce7, #5a4fcf)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 24px rgba(115, 103, 240, 0.5)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <ArrowUp size={20} />
      </Fab>
    </Zoom>
  );
});

export default ScrollToTop;

import React from 'react';
import { Box } from '@mui/material';

export default function GridBackground({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(115, 103, 240, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(115, 103, 240, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70vw',
          opacity: 0.5,
          background: 'radial-gradient(circle, rgba(115,103,240,0.18) 0%, transparent 60%)',
          filter: 'blur(100px)',
          zIndex: 0,
        }}
      />
      {children}
    </Box>
  );
}

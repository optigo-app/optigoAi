'use client';
import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

const CustomSlider = React.memo(function CustomSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  disabled = false,
  showValue = true,
  size = 'medium'
}) {
  const sizeConfig = {
    small: { height: 4, thumb: 16 },
    medium: { height: 6, thumb: 20 },
    large: { height: 8, thumb: 24 }
  };

  const config = sizeConfig[size];

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            {label}
          </Typography>
          {showValue && (
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-color, #7367f0)' }}>
              {value}{unit}
            </Typography>
          )}
        </Box>
      )}

      <Slider
        value={value}
        onChange={(e, newValue) => onChange?.(newValue)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        sx={{
          color: 'var(--primary-color, #7367f0)',
          height: config.height,
          '& .MuiSlider-track': {
            border: 'none',
            background: 'linear-gradient(90deg, rgba(115, 103, 240, 0.7) 0%, var(--primary-color, #7367f0) 100%)',
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(115, 103, 240, 0.2)',
            opacity: 1,
          },
          '& .MuiSlider-thumb': {
            height: config.thumb,
            width: config.thumb,
            backgroundColor: 'var(--primary-color, #7367f0)',
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(115, 103, 240, 0.3)',
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: '0 4px 12px rgba(115, 103, 240, 0.4)',
            },
          },
          '& .MuiSlider-valueLabel': {
            lineHeight: 1.2,
            fontSize: 12,
            background: 'var(--primary-color, #7367f0)',
            padding: '4px 8px',
            borderRadius: '4px',
            '&:before': {
              borderBottomColor: 'var(--primary-color, #7367f0)',
            },
          },
        }}
      />
    </Box>
  );
});

export default CustomSlider;

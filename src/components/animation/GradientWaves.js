'use client';
import React, { useEffect, useRef } from 'react';

export const GradientWaves = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Wave parameters
    const waves = [
      { amplitude: 60, wavelength: 300, speed: 0.0015, offset: 0, color: 'rgba(115,103,240,0.3)' },
      { amplitude: 40, wavelength: 200, speed: 0.002, offset: 100, color: 'rgba(115,103,240,0.5)' },
      { amplitude: 80, wavelength: 500, speed: 0.001, offset: 200, color: 'rgba(115,103,240,0.2)' },
    ];

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        for (let x = 0; x < width; x += 1) {
          const y =
            height / 2 +
            wave.amplitude * Math.sin((x / wave.wavelength) * 2 * Math.PI + time + wave.offset);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, wave.color);
        gradient.addColorStop(1, 'rgba(115,103,240,0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      time += 0.02;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

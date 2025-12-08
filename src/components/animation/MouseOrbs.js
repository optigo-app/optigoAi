'use client';
import React, { useEffect, useRef } from "react";

export const MouseOrbs = ({ count = 15 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const orbs = Array.from({ length: count }, () => ({
      x: width / 2,
      y: height / 2,
      r: Math.random() * 6 + 4,
      alpha: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.08 + 0.02,
    }));

    let mouse = { x: width / 2, y: height / 2 };
    const handleMouseMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      orbs.forEach(o => {
        // smooth lag
        o.x += (mouse.x - o.x) * o.speed;
        o.y += (mouse.y - o.y) * o.speed;

        const gradient = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 4);
        gradient.addColorStop(0, 'rgba(115,103,240,0.7)'); // start
        gradient.addColorStop(1, 'rgba(115,103,240,0)');   // fade

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [count]);

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }} />
  );
};

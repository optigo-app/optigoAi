'use client';
import React, { useEffect, useRef } from "react";

export const Fireflies = ({ layers = 3 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Define different gradients for layers
        const gradients = [
            ['rgba(115,103,240,0.7)', 'rgba(115,103,240,0)'], // purple
            ['rgba(240,103,200,0.6)', 'rgba(240,103,200,0)'], // pink
            ['rgba(103,200,240,0.5)', 'rgba(103,200,240,0)'], // soft blue
        ];

        // Create fireflies for each layer
        const fireflies = [];
        for (let i = 0; i < layers; i++) {
            const count = 40 + i * 20; // more fireflies in higher layers
            for (let j = 0; j < count; j++) {
                fireflies.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: Math.random() * 3 + 1 + i * 0.5, // larger for higher layers
                    dx: (Math.random() - 0.5) * (0.2 + i * 0.1),
                    dy: (Math.random() - 0.5) * (0.2 + i * 0.1),
                    alpha: Math.random() * 0.8 + 0.2,
                    delta: Math.random() * 0.02 + 0.01,
                    gradient: gradients[i % gradients.length]
                });
            }
        }

        let mouse = { x: width / 2, y: height / 2 };
        const handleMouseMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            fireflies.forEach(f => {
                f.x += f.dx;
                f.y += f.dy;
                f.alpha += f.delta;

                if (f.alpha > 1 || f.alpha < 0) f.delta *= -1;
                if (f.x < 0 || f.x > width) f.dx *= -1;
                if (f.y < 0 || f.y > height) f.dy *= -1;

                // Slight attraction to cursor
                const distX = mouse.x - f.x;
                const distY = mouse.y - f.y;
                f.x += distX * 0.0005;
                f.y += distY * 0.0005;

                // Draw firefly with layer-specific gradient
                const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 4);
                gradient.addColorStop(0, f.gradient[0]);
                gradient.addColorStop(1, f.gradient[1]);

                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
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
    }, [layers]);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }}
        />
    );
};

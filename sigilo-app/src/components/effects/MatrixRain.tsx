"use client";

import { useEffect, useRef } from "react";

interface MatrixRainProps {
  opacity?: number;
  speed?: number;   // drift speed
  density?: number; // 0–1, particle density
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  pulse: number;
  pulseSpeed: number;
}

export function MatrixRain({
  opacity = 0.5,
  speed = 0.6,
  density = 0.7,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mouse = {
      x: 0,
      y: 0,
      active: false,
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const area = canvas.width * canvas.height;
    const baseCount = Math.max(
      70,
      Math.min(260, Math.floor((area / 14000) * density))
    );

    const createParticles = () => {
      particles.length = 0;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.75;

      for (let i = 0; i < baseCount; i++) {
        // bias positions slightly towards center (shield/core feeling)
        const angle = Math.random() * Math.PI * 2;
        const radius =
          Math.sqrt(Math.random()) * maxRadius * 0.6 + // core cluster
          Math.random() * maxRadius * 0.2; // outer spread

        const x = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 40;
        const y = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 40;

        const size = 1.1 + Math.random() * 1.8;
        const vx = (Math.random() - 0.5) * speed;
        const vy = (Math.random() - 0.5) * speed;

        particles.push({
          x,
          y,
          vx,
          vy,
          baseX: x,
          baseY: y,
          size,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    };

    createParticles();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let animationId: number;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // darker, subtle trail (privacy veil)
      ctx.fillStyle = "rgba(4, 7, 10, 0.32)";
      ctx.fillRect(0, 0, w, h);

      const baseColor = { r: 18, g: 180, b: 168 }; // core teal
      const glowColor = { r: 140, g: 255, b: 240 }; // near cursor glow
      const coreHighlightColor = { r: 110, g: 220, b: 210 }; // center “shield”

      const interactionRadius = Math.min(w, h) * 0.2;
      const interactionStrength = 0.13;
      const returnForce = 0.0025;

      for (const p of particles) {
        // drift
        p.x += p.vx;
        p.y += p.vy;

        // soft pull back to base (so it feels structured)
        const dxBase = p.baseX - p.x;
        const dyBase = p.baseY - p.y;
        p.x += dxBase * returnForce;
        p.y += dyBase * returnForce;

        // wrap edges
        if (p.x < -80) p.x = w + 80;
        if (p.x > w + 80) p.x = -80;
        if (p.y < -80) p.y = h + 80;
        if (p.y > h + 80) p.y = -80;

        // pulse update
        p.pulse += p.pulseSpeed;
        const pulseFactor = 0.65 + (Math.sin(p.pulse) + 1) * 0.35; // 0.65–1.35

        // distance to center → core shield effect
        const dcx = p.x - cx;
        const dcy = p.y - cy;
        const distCenter = Math.sqrt(dcx * dcx + dcy * dcy);
        const centerRadius = Math.min(w, h) * 0.45;
        const centerT = Math.max(0, 1 - distCenter / centerRadius); // 0 at edge, 1 at core

        let size = p.size * pulseFactor;
        let r =
          baseColor.r +
          (coreHighlightColor.r - baseColor.r) * (centerT * 0.7);
        let g =
          baseColor.g +
          (coreHighlightColor.g - baseColor.g) * (centerT * 0.7);
        let b =
          baseColor.b +
          (coreHighlightColor.b - baseColor.b) * (centerT * 0.7);
        let alpha = opacity * (0.3 + 0.7 * pulseFactor);

        // mouse interaction → encrypted shield reacting
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactionRadius && dist > 0.0001) {
            const force =
              ((interactionRadius - dist) / interactionRadius) *
              interactionStrength;
            p.x += (dx / dist) * force * 135;
            p.y += (dy / dist) * force * 135;

            const t = 1 - dist / interactionRadius;
            size = size + t * 1.7;
            r = r + (glowColor.r - r) * t;
            g = g + (glowColor.g - g) * t;
            b = b + (glowColor.b - b) * t;
            alpha = opacity * (0.6 + t * 0.9);
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
          b
        )}, ${alpha})`;
        ctx.fill();
      }

      // encrypted network connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 130;
          if (dist < maxDist) {
            const t = 1 - dist / maxDist;
            const lineAlpha = opacity * 0.22 * t;

            // slightly stronger lines near the center = “core graph”
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const mcx = midX - cx;
            const mcy = midY - cy;
            const midCenter = Math.sqrt(mcx * mcx + mcy * mcy);
            const midT = Math.max(0, 1 - midCenter / (Math.min(w, h) * 0.55));

            const finalAlpha = lineAlpha * (0.7 + midT * 0.6);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(40, 200, 190, ${finalAlpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [opacity, speed, density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ opacity }}
    />
  );
}

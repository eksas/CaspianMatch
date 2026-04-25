import { useEffect, useRef } from "react";

export function WaterLayer({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t0 = performance.now();
    let lastDraw = 0;
    let cursor = { x: -9999, y: -9999, lastMove: 0 };
    let paused = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      cursor.x = e.clientX - r.left;
      cursor.y = e.clientY - r.top;
      cursor.lastMove = performance.now();
    };
    window.addEventListener("mousemove", onMove);

    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const draw = (ts: number) => {
      if (!paused && !prefersReduced && ts - lastDraw >= 33) {
        lastDraw = ts;
        const t = (ts - t0) / 1000;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#FBFDFF");
        grad.addColorStop(0.55, "#F0F7FC");
        grad.addColorStop(1, "#D6E4F0");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const bands = 3;
        for (let b = 0; b < bands; b++) {
          ctx.beginPath();
          const amp = (18 + b * 10) * intensity;
          const freq = 0.0035 + b * 0.002;
          const phase = t * (0.35 + b * 0.22);
          const yBase = h * (0.62 + b * 0.12);
          ctx.moveTo(0, h);
          for (let x = 0; x <= w; x += 6) {
            const dx = cursor.x - x;
            const dy = cursor.y - yBase;
            const d = Math.sqrt(dx * dx + dy * dy);
            const timeSinceMove = (ts - cursor.lastMove) / 1000;
            const cursorBump = d < 300 && timeSinceMove < 2.4
              ? Math.cos((d / 300) * Math.PI * 0.5) * (1 - Math.min(timeSinceMove / 2.4, 1)) * 14
              : 0;
            const y = yBase + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 1.7 + phase * 1.3) * amp * 0.4 - cursorBump;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.closePath();
          const alpha = 0.18 + b * 0.18;
          ctx.fillStyle = `rgba(58,143,204,${alpha})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [intensity]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden />;
}

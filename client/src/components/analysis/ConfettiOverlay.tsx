import { useEffect, useRef } from "react";

interface ConfettiOverlayProps {
  active: boolean;
  durationMs?: number;
}

export function ConfettiOverlay({ active, durationMs = 3500 }: ConfettiOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#1a7a4c", "#86efac", "#fbbf24", "#fff", "#34d399", "#fde68a"];
    let pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 8,
    }));

    const start = Date.now();
    let frameId = 0;

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      pieces = pieces.filter((p) => p.y < canvas.height + 20);
      if (Date.now() - start < durationMs && pieces.length) {
        frameId = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    frameId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, durationMs]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[300]"
      aria-hidden
    />
  );
}

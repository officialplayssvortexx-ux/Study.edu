import { useEffect, useRef } from "react";
import { BackgroundPreset } from "../types";

interface BackgroundEffectProps {
  preset: BackgroundPreset;
  customBackgroundUrl: string | null;
}

export default function BackgroundEffect({ preset, customBackgroundUrl }: BackgroundEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      speed: number;
      length?: number;
      size: number;
      opacity: number;
      angle?: number;
    }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = preset.id === "mint-moss" ? 50 : preset.id === "ocean-breeze" ? 60 : 0;

      for (let i = 0; i < count; i++) {
        if (preset.id === "mint-moss") {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 0.3 + Math.random() * 0.7,
            size: 2 + Math.random() * 3,
            opacity: 0.15 + Math.random() * 0.35,
            angle: Math.random() * Math.PI * 2,
          });
        } else if (preset.id === "ocean-breeze") {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 0.2 + Math.random() * 0.5,
            size: 1.5 + Math.random() * 3.5,
            opacity: 0.1 + Math.random() * 0.3,
            angle: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (preset.id === "mint-moss") {
        particles.forEach((p) => {
          ctx.fillStyle = "rgba(16, 185, 129, 0.4)"; // mint/moss green pollen
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += Math.sin(p.angle || 0) * 0.2;
          p.y -= p.speed;
          if (p.angle !== undefined) p.angle += 0.008;

          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
        });
      } else if (preset.id === "ocean-breeze") {
        particles.forEach((p) => {
          ctx.fillStyle = "rgba(14, 165, 233, 0.25)"; // soft ocean water mist bubble
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += Math.cos(p.angle || 0) * 0.15;
          p.y -= p.speed;
          if (p.angle !== undefined) p.angle += 0.005;

          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [preset.id]);

  if (preset.type === "uploaded" && customBackgroundUrl) {
    return (
      <div
        id="bg-uploaded"
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000 z-0"
        style={{ backgroundImage: `url(${customBackgroundUrl})` }}
      />
    );
  }

  if (preset.type === "video" && preset.videoUrl) {
    return (
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 bg-slate-950 transition-all duration-1000">
        <video
          key={preset.id}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          <source src={preset.videoUrl} type="video/mp4" />
        </video>
        {/* Soft atmospheric overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 w-full h-full transition-all duration-1000 z-0 overflow-hidden ${preset.class}`}
      style={preset.style}
    >
      {/* Floating Canvas for active particles */}
      {preset.type === "animated" && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full mix-blend-multiply opacity-80" />
      )}

      {/* Ambient glass-like backdrop highlights */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />
    </div>
  );
}

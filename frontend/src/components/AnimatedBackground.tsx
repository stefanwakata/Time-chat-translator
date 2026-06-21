import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

const COLORS = [
  "139,92,246",   // purple
  "6,182,212",    // cyan
  "59,130,246",   // blue
  "167,139,250",  // light purple
  "34,211,238",   // light cyan
];

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Spawn particles near cursor
      for (let i = 0; i < 3; i++) {
        spawnParticle(e.clientX, e.clientY, true);
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    // Spawn ambient particles
    const spawnParticle = (x?: number, y?: number, fromMouse = false) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const maxLife = fromMouse ? 80 + Math.random() * 60 : 150 + Math.random() * 200;
      particlesRef.current.push({
        x: x ?? Math.random() * canvas.width,
        y: y ?? Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (fromMouse ? 2 : 0.4),
        vy: (Math.random() - 0.5) * (fromMouse ? 2 : 0.4) - (fromMouse ? 0 : 0.2),
        radius: fromMouse
          ? 2 + Math.random() * 4
          : 8 + Math.random() * 40,
        opacity: fromMouse ? 0.7 : 0.08 + Math.random() * 0.12,
        color,
        life: 0,
        maxLife,
      });
    };

    // Seed ambient
    for (let i = 0; i < 18; i++) spawnParticle();

    // Ambient spawn interval
    const ambientInterval = setInterval(() => {
      if (particlesRef.current.length < 40) spawnParticle();
    }, 600);

    // Draw loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark base gradient
      const bg = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.8
      );
      bg.addColorStop(0, "rgba(12,8,35,1)");
      bg.addColorStop(1, "rgba(3,3,15,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mouse glow
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0) {
        const mglow = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        mglow.addColorStop(0, "rgba(139,92,246,0.08)");
        mglow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mglow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Update + draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
      particlesRef.current.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Attract slightly toward mouse
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300 && dist > 0) {
          const force = 0.015 * (1 - dist / 300);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        const progress = p.life / p.maxLife;
        const fade = progress < 0.2
          ? progress / 0.2
          : progress > 0.7
            ? 1 - (progress - 0.7) / 0.3
            : 1;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        glow.addColorStop(0, `rgba(${p.color},${p.opacity * fade})`);
        glow.addColorStop(0.5, `rgba(${p.color},${p.opacity * fade * 0.4})`);
        glow.addColorStop(1, `rgba(${p.color},0)`);

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid lines (subtle)
      ctx.strokeStyle = "rgba(139,92,246,0.035)";
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      clearInterval(ambientInterval);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

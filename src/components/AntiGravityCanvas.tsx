import React, { useEffect, useRef, useState } from 'react';

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  kind: 'box' | 'monitor' | 'fridge' | 'qr';
  accent: string;
  angle: number;
  vAngle: number;
}

const NODE_COUNT = 65;
const REPULSION_RADIUS = 140;

export const AntiGravityCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const nodesRef = useRef<ParticleNode[]>([]);
  const [repelledCount, setRepelledCount] = useState<number>(0);

  const triggerGravityPulse = () => {
    const nodes = nodesRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !nodes.length) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (const node of nodes) {
      const dx = node.x - cx;
      const dy = node.y - cy;
      const dist = Math.max(20, Math.hypot(dx, dy));
      node.vx += (dx / dist) * 4.5;
      node.vy += (dy / dist) * 4.5;
    }
    setRepelledCount((prev) => prev + nodes.length);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const kinds: ParticleNode['kind'][] = ['box', 'monitor', 'fridge', 'qr'];
    const accents = ['#8B5CF6', '#06B6D4', '#A78BFA', '#38BDF8'];

    const initNodes = (width: number, height: number) => {
      const arr: ParticleNode[] = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        arr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          size: 8 + (i % 4) * 3,
          kind: kinds[i % kinds.length],
          accent: accents[i % accents.length],
          angle: Math.random() * Math.PI * 2,
          vAngle: (Math.random() - 0.5) * 0.012,
        });
      }
      nodesRef.current = arr;
    };

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect ? Math.floor(rect.width) : 1200;
      const h = rect ? Math.floor(rect.height) : 520;
      canvas.width = w;
      canvas.height = h;
      if (nodesRef.current.length === 0) {
        initNodes(w, h);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let animId = 0;
    let frameCounter = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Subtle architectural coordinate grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.04)';
      ctx.lineWidth = 1;
      const gridStep = 64;
      for (let gx = 0; gx < w; gx += gridStep) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      let activeRepulsions = 0;

      // Connect nearby nodes with faint custody tethers
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 110 * 110) {
            const alpha = (1 - Math.sqrt(distSq) / 110) * 0.14;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Update physics and draw each dorm-gear node
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPULSION_RADIUS && dist > 0.1) {
            const force = ((REPULSION_RADIUS - dist) / REPULSION_RADIUS) * 0.65;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
            activeRepulsions++;
          }
        }

        // Gentle damping back to low-gravity drift
        n.vx *= 0.985;
        n.vy *= 0.985;

        const speed = Math.hypot(n.vx, n.vy);
        if (speed < 0.22) {
          n.vx += (Math.random() - 0.5) * 0.06;
          n.vy += (Math.random() - 0.5) * 0.06;
        }

        n.x += n.vx;
        n.y += n.vy;
        n.angle += n.vAngle;

        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;

        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.angle);
        ctx.strokeStyle = n.accent;
        ctx.fillStyle = 'rgba(10, 15, 24, 0.78)';
        ctx.lineWidth = 1.25;

        const s = n.size;
        if (n.kind === 'box') {
          ctx.beginPath();
          ctx.rect(-s / 2, -s / 2, s, s);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-s / 2, 0);
          ctx.lineTo(s / 2, 0);
          ctx.stroke();
        } else if (n.kind === 'monitor') {
          ctx.beginPath();
          ctx.rect(-s * 0.65, -s * 0.42, s * 1.3, s * 0.84);
          ctx.fill();
          ctx.stroke();
        } else if (n.kind === 'fridge') {
          ctx.beginPath();
          ctx.rect(-s * 0.42, -s * 0.65, s * 0.84, s * 1.3);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      if (mouse.active) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, REPULSION_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
      }

      frameCounter++;
      if (frameCounter % 20 === 0 && activeRepulsions > 0) {
        setRepelledCount((prev) => prev + activeRepulsions);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="relative w-full h-full"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
        };
      }}
      onMouseLeave={() => {
        mouseRef.current.active = false;
      }}
    >
      <canvas
        ref={canvasRef}
        data-testid="anti-gravity-canvas"
        data-node-count={NODE_COUNT}
        data-repelled-interactions={repelledCount}
        aria-label="Interactive zero-gravity student logistics particle simulation"
        className="w-full h-full block"
      />
      <div className="absolute top-4 right-4 z-30 hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#04060a]/85 border border-white/10 backdrop-blur-sm">
        <span className="text-xs text-slate-300 font-mono tabular-nums">
          65 Zero-G Nodes · 140px Cursor Repulsion
        </span>
        <button
          type="button"
          onClick={triggerGravityPulse}
          className="px-3 py-1 text-xs font-semibold text-white bg-violet-600/90 hover:bg-violet-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Pulse Kinetic Field
        </button>
      </div>
    </div>
  );
};

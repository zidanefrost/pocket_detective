import React, { useEffect, useRef } from 'react';

export const OrbitalRings3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle1 = 0;
    let angle2 = 0;
    let angle3 = 0;

    const render = () => {
      const width = canvas.clientWidth || 200;
      const height = canvas.clientHeight || 200;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      angle1 += 0.02;
      angle2 -= 0.015;
      angle3 += 0.025;

      // Outer Emerald Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle1);
      ctx.scale(1, 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // Middle Indigo Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle2);
      ctx.scale(0.4, 1);
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // Inner Glowing Core Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle3);
      ctx.scale(0.8, 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.restore();

      // Glowing Center Orb
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-48 h-48 relative flex items-center justify-center">
      <div className="absolute inset-0 bg-[#06b6d4]/10 rounded-full blur-[30px]" />
      <canvas ref={canvasRef} className="w-full h-full block relative z-10" />
    </div>
  );
};

import { useEffect, useState } from "react";

const COLORS = ["#22c55e","#16a34a","#f59e0b","#fb7185","#a78bfa","#38bdf8","#facc15"];

export function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; bg: string; dur: number; delay: number }[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const arr = Array.from({ length: 80 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      bg: COLORS[Math.floor(Math.random() * COLORS.length)],
      dur: 2 + Math.random() * 2,
      delay: Math.random() * 0.4,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 4500);
    return () => clearTimeout(t);
  }, [trigger]);
  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.bg,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";

interface Props { value: number; size?: number; stroke?: number; showLabel?: boolean; className?: string }

function colorFor(pct: number) {
  if (pct >= 100) return "hsl(var(--success))";
  if (pct >= 66)  return "hsl(142 60% 50%)";
  if (pct >= 33)  return "hsl(var(--accent))";
  if (pct > 0)    return "hsl(8 80% 60%)";
  return "hsl(var(--muted-foreground) / 0.4)";
}

export function ProgressRing({ value, size = 44, stroke = 4, showLabel = true, className }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(clamped), 50);
    return () => clearTimeout(t);
  }, [clamped]);
  const offset = c - (animated / 100) * c;
  const color = colorFor(clamped);
  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="hsl(var(--muted-foreground) / 0.18)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.2,.8,.2,1), stroke 0.4s" }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-[10px] font-bold tabular-nums" style={{ color }}>
          {clamped}%
        </span>
      )}
    </div>
  );
}

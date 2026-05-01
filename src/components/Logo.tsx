import { Sprout } from "lucide-react";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground pop-shadow"
           style={{ width: size + 10, height: size + 10 }}>
        <Sprout className="text-primary-foreground" size={size - 4} strokeWidth={2.4} />
      </div>
      <div className="leading-none">
        <div className="font-display text-2xl text-primary -mb-1">Keep</div>
        <div className="font-extrabold tracking-tight text-foreground text-lg">Growing</div>
      </div>
    </div>
  );
}

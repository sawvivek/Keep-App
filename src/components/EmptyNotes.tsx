import { Sprout } from "lucide-react";

export function EmptyNotes({ message = "Notes you add appear here", subtitle }: { message?: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 animate-fade-in">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative size-24 rounded-3xl bg-gradient-primary text-primary-foreground grid place-items-center pop-shadow animate-float">
          <Sprout size={42} strokeWidth={2.2} />
        </div>
      </div>
      <h3 className="font-display text-3xl text-foreground mb-1">Plant your first idea</h3>
      <p className="text-muted-foreground text-sm max-w-xs">{subtitle ?? message}</p>
    </div>
  );
}

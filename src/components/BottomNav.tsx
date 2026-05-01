import { Home, LayoutDashboard, Plus, Tag, Archive } from "lucide-react";

export type View = "home" | "dashboard" | "labels" | "archive";

interface Props { view: View; onView: (v: View) => void; onAdd: () => void }

export function BottomNav({ view, onView, onAdd }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/85 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto grid grid-cols-5 items-center h-16 px-2 relative">
        <NavBtn icon={<Home size={20} />}            label="Home"      active={view==="home"}      onClick={() => onView("home")} />
        <NavBtn icon={<LayoutDashboard size={20} />} label="Dashboard" active={view==="dashboard"} onClick={() => onView("dashboard")} />

        <div className="grid place-items-center">
          <button
            onClick={onAdd}
            aria-label="Add note"
            className="-mt-8 size-14 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center pop-shadow ring-4 ring-background hover:scale-105 active:scale-95 transition"
          >
            <Plus size={24} strokeWidth={2.6} />
          </button>
        </div>

        <NavBtn icon={<Tag size={20} />}     label="Labels"  active={view==="labels"}  onClick={() => onView("labels")} />
        <NavBtn icon={<Archive size={20} />} label="Archive" active={view==="archive"} onClick={() => onView("archive")} />
      </div>
    </nav>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 h-full transition ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
      <div className={`px-3 py-1 rounded-full transition ${active ? "bg-primary/12" : ""}`}>{icon}</div>
      <span className={`text-[10.5px] font-medium ${active ? "text-primary" : ""}`}>{label}</span>
    </button>
  );
}

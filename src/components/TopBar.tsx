import { Search, Moon, Sun, Download } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";

interface Props { search: string; setSearch: (s: string) => void; streak: number }

export function TopBar({ search, setSearch, streak }: Props) {
  const { state, setTheme, exportJSON } = useStore();

  function handleExport() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keepgrowing-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-lg border-b border-border/70">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Logo />
        <div className="flex-1 max-w-xl ml-auto">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your notes..."
              className="w-full h-10 pl-9 pr-3 rounded-full bg-secondary/70 border border-transparent focus:border-primary/40 focus:bg-card outline-none text-sm transition"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-foreground bg-accent/15 text-accent px-2.5 py-1 rounded-full">
            🔥 {streak}
          </span>
          <button onClick={handleExport} title="Export backup" className="size-10 grid place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition">
            <Download size={18} />
          </button>
          <button
            onClick={() => setTheme(state.theme === "dark" ? "light" : "dark")}
            className="size-10 grid place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition"
            aria-label="Toggle theme"
          >
            {state.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-3 sm:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your notes..."
            className="w-full h-10 pl-9 pr-3 rounded-full bg-secondary/70 border border-transparent focus:border-primary/40 focus:bg-card outline-none text-sm"
          />
        </div>
      </div>
    </header>
  );
}

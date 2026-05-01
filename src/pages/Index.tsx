import { useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav, View } from "@/components/BottomNav";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { Dashboard } from "@/components/Dashboard";
import { LabelsView } from "@/components/LabelsView";
import { EmptyNotes } from "@/components/EmptyNotes";
import { Confetti } from "@/components/Confetti";
import { useStore } from "@/lib/store";
import { Note, noteProgress } from "@/lib/types";
import { ArrowDownAZ, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Sort = "updated" | "due" | "progress";

const Index = () => {
  const { state, addNote, togglePin } = useStore();
  const [view, setView] = useState<View>("home");
  const [search, setSearch] = useState("");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("updated");
  const [dashboardConfetti, setDashboardConfetti] = useState(0);

  const lastMilestone = useMemo(() => {
    const active = state.notes.filter(n => !n.archived);
    const t = active.reduce((s, n) => s + n.checklist.length, 0);
    const d = active.reduce((s, n) => s + n.checklist.filter(i => i.done).length, 0);
    return t === 0 ? 0 : Math.round((d / t) * 100);
  }, [state.notes]);

  function filtered(archived: boolean): Note[] {
    const q = search.trim().toLowerCase();
    let list = state.notes.filter(n => n.archived === archived);
    if (q) list = list.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || (n.label?.toLowerCase().includes(q)));
    if (activeLabel) list = list.filter(n => n.label === activeLabel);
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "due") {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (da !== db) return da - db;
      }
      if (sort === "progress") {
        const pa = noteProgress(a).pct;
        const pb = noteProgress(b).pct;
        if (pa !== pb) return pb - pa;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return list;
  }

  const homeNotes = filtered(false);
  const archived = filtered(true);
  const pinned = homeNotes.filter(n => n.pinned);
  const others = homeNotes.filter(n => !n.pinned);

  function handleAdd() {
    const n = addNote();
    setEditingId(n.id);
    if (view !== "home") setView("home");
  }

  function handleComplete100() {
    toast("🎉 Note completed!", { description: "Keep growing — one task at a time." });
    // also evaluate dashboard milestones
    const active = state.notes.filter(n => !n.archived);
    const t = active.reduce((s, n) => s + n.checklist.length, 0);
    const d = active.reduce((s, n) => s + n.checklist.filter(i => i.done).length, 0);
    const overall = t === 0 ? 0 : Math.round((d / t) * 100);
    if ((lastMilestone < 100 && overall >= 100) || (lastMilestone < 50 && overall >= 50)) {
      setDashboardConfetti(Date.now());
      toast("🌳 Keep Growing!", { description: overall >= 100 ? "You hit 100% overall — incredible!" : "You crossed 50% overall progress!" });
    }
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <Confetti trigger={dashboardConfetti} />
      <TopBar search={search} setSearch={setSearch} streak={state.streak.count} />

      <main className="max-w-6xl mx-auto px-3 sm:px-5 py-4">
        {view === "home" && (
          <>
            <div className="flex items-center justify-between gap-2 mb-3 px-1">
              <div>
                <div className="font-display text-3xl text-foreground leading-none">
                  {greeting()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {homeNotes.length} active note{homeNotes.length === 1 ? "" : "s"}{activeLabel ? ` in “${activeLabel}”` : ""}.
                </p>
              </div>
              <SortMenu sort={sort} setSort={setSort} />
            </div>

            {homeNotes.length === 0 ? (
              <EmptyNotes subtitle={search || activeLabel ? "No matching notes — try clearing filters." : "Tap the green + to plant your first thought and watch it grow."} />
            ) : (
              <div className="space-y-5">
                {pinned.length > 0 && (
                  <Section title="Pinned">
                    <div className="masonry">
                      {pinned.map(n => <NoteCard key={n.id} note={n} onClick={() => setEditingId(n.id)} onPin={() => togglePin(n.id)} />)}
                    </div>
                  </Section>
                )}
                {others.length > 0 && (
                  <Section title={pinned.length > 0 ? "Others" : undefined}>
                    <div className="masonry">
                      {others.map(n => <NoteCard key={n.id} note={n} onClick={() => setEditingId(n.id)} onPin={() => togglePin(n.id)} />)}
                    </div>
                  </Section>
                )}
              </div>
            )}
          </>
        )}

        {view === "dashboard" && <Dashboard onOpenNote={(id) => setEditingId(id)} />}

        {view === "labels" && (
          <LabelsView activeLabel={activeLabel} setActiveLabel={(l) => { setActiveLabel(l); setView("home"); }} />
        )}

        {view === "archive" && (
          archived.length === 0 ? (
            <EmptyNotes subtitle="Archived notes will appear here." />
          ) : (
            <Section title="Archive">
              <div className="masonry">
                {archived.map(n => <NoteCard key={n.id} note={n} onClick={() => setEditingId(n.id)} onPin={() => togglePin(n.id)} />)}
              </div>
            </Section>
          )
        )}
      </main>

      <BottomNav view={view} onView={setView} onAdd={handleAdd} />

      <NoteEditor noteId={editingId} onClose={() => setEditingId(null)} onComplete100={handleComplete100} />
    </div>
  );
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Late night thoughts";
  if (h < 12) return "Good morning ☀️";
  if (h < 18) return "Good afternoon";
  return "Good evening 🌙";
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section>
      {title && <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2 px-1">{title}</h2>}
      {children}
    </section>
  );
}

function SortMenu({ sort, setSort }: { sort: Sort; setSort: (s: Sort) => void }) {
  const opts: { key: Sort; label: string; icon: React.ReactNode }[] = [
    { key: "updated",  label: "Recent",   icon: <ArrowDownAZ size={14} /> },
    { key: "due",      label: "Due date", icon: <Calendar size={14} /> },
    { key: "progress", label: "Progress", icon: <Sparkles size={14} /> },
  ];
  return (
    <div className="inline-flex p-1 rounded-full bg-secondary/80 border border-border">
      {opts.map(o => (
        <button
          key={o.key}
          onClick={() => setSort(o.key)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold transition ${sort === o.key ? "bg-card text-foreground note-shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o.icon}
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Index;

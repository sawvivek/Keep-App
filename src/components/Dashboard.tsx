import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { noteProgress } from "@/lib/types";
import { ProgressRing } from "./ProgressRing";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Flame, ListChecks, Notebook, CheckCircle2, Sparkles, AlertTriangle } from "lucide-react";

export function Dashboard({ onOpenNote }: { onOpenNote: (id: string) => void }) {
  const { state } = useStore();
  const active = state.notes.filter(n => !n.archived);

  const stats = useMemo(() => {
    const totalNotes = active.length;
    const totalTasks = active.reduce((s, n) => s + n.checklist.length, 0);
    const tasksDone = active.reduce((s, n) => s + n.checklist.filter(i => i.done).length, 0);
    const overall = totalTasks === 0 ? 0 : Math.round((tasksDone / totalTasks) * 100);
    return { totalNotes, totalTasks, tasksDone, overall };
  }, [active]);

  const chartData = useMemo(
    () => active
      .filter(n => n.checklist.length > 0)
      .map(n => ({ name: (n.title || "Untitled").slice(0, 14), pct: noteProgress(n).pct, id: n.id }))
      .sort((a,b) => b.pct - a.pct)
      .slice(0, 8),
    [active]
  );

  const mostProgressed = useMemo(() => {
    const list = active.filter(n => n.checklist.length > 0);
    return list.sort((a, b) => noteProgress(b).pct - noteProgress(a).pct)[0] ?? null;
  }, [active]);

  const needsAttention = useMemo(
    () => active.filter(n => n.checklist.length > 0 && noteProgress(n).pct < 30),
    [active]
  );

  const motivational =
    stats.overall >= 100 ? "🌳 Incredible — you’ve completed everything!" :
    stats.overall >= 50  ? "🌿 Keep growing — you’re past halfway!" :
    "🌱 Every small step counts. Keep going.";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 sm:p-6 pop-shadow relative overflow-hidden">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-4 -bottom-12 size-44 rounded-full bg-accent/30 blur-2xl" />
        <div className="relative grid sm:grid-cols-[auto,1fr] gap-5 items-center">
          <div className="grid place-items-center">
            <div className="relative">
              <ProgressRing value={stats.overall} size={140} stroke={11} showLabel={false} />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-3xl font-extrabold tabular-nums">{stats.overall}%</div>
                  <div className="text-[11px] uppercase tracking-wider opacity-80">overall</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="font-display text-3xl sm:text-4xl mb-1">Your growth</div>
            <p className="text-primary-foreground/85 text-sm mb-4 max-w-md">{motivational}</p>
            <div className="grid grid-cols-3 gap-2">
              <Stat icon={<Notebook size={16} />}    label="Notes"     value={stats.totalNotes} />
              <Stat icon={<ListChecks size={16} />}  label="Tasks"     value={stats.totalTasks} />
              <Stat icon={<CheckCircle2 size={16} />} label="Done"     value={stats.tasksDone} />
            </div>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4 note-shadow">
        <div className="size-12 rounded-2xl bg-gradient-warm grid place-items-center text-white text-2xl">
          <Flame size={22} />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Daily streak</div>
          <div className="font-extrabold text-2xl text-foreground tabular-nums">{state.streak.count} day{state.streak.count === 1 ? "" : "s"}</div>
        </div>
        <div className="text-3xl">🔥</div>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl border border-border bg-card p-4 note-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Progress by note</h3>
          <span className="text-xs text-muted-foreground">{chartData.length} tracked</span>
        </div>
        {chartData.length === 0 ? (
          <EmptyState text="Add a checklist to a note to see progress." />
        ) : (
          <div className="h-60 -ml-2">
            <ResponsiveContainer>
              <BarChart data={chartData} barCategoryGap="22%">
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-12} textAnchor="end" height={56} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} width={36} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Progress"]}
                />
                <Bar dataKey="pct" radius={[8, 8, 4, 4]} onClick={(d: any) => d?.id && onOpenNote(d.id)} className="cursor-pointer">
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={
                      d.pct >= 100 ? "hsl(var(--success))" :
                      d.pct >= 66  ? "hsl(142 60% 50%)" :
                      d.pct >= 33  ? "hsl(var(--accent))" :
                      d.pct > 0    ? "hsl(8 80% 60%)" :
                                     "hsl(var(--muted-foreground) / 0.4)"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Most progressed */}
        <div className="rounded-2xl border border-border bg-card p-4 note-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-primary" />
            <h3 className="font-bold text-foreground">Most progressed</h3>
          </div>
          {mostProgressed ? (
            <button
              onClick={() => onOpenNote(mostProgressed.id)}
              className="w-full text-left flex items-center gap-3 rounded-xl bg-secondary/60 hover:bg-secondary p-3 transition"
            >
              <ProgressRing value={noteProgress(mostProgressed).pct} size={50} stroke={5} />
              <div className="min-w-0">
                <div className="font-semibold truncate">{mostProgressed.title || "Untitled"}</div>
                <div className="text-xs text-muted-foreground">{noteProgress(mostProgressed).done}/{noteProgress(mostProgressed).total} tasks</div>
              </div>
            </button>
          ) : <EmptyState text="No tracked notes yet." />}
        </div>

        {/* Needs attention */}
        <div className="rounded-2xl border border-border bg-card p-4 note-shadow">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-warning" />
            <h3 className="font-bold text-foreground">Needs attention</h3>
            <span className="ml-auto text-xs text-muted-foreground">below 30%</span>
          </div>
          {needsAttention.length === 0 ? (
            <EmptyState text="Nothing slipping. Nice work! 🎉" />
          ) : (
            <div className="space-y-2">
              {needsAttention.slice(0, 4).map(n => (
                <button
                  key={n.id}
                  onClick={() => onOpenNote(n.id)}
                  className="w-full text-left flex items-center gap-3 rounded-xl bg-secondary/60 hover:bg-secondary p-2.5 transition"
                >
                  <ProgressRing value={noteProgress(n).pct} size={38} stroke={4} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate text-sm">{n.title || "Untitled"}</div>
                    <div className="text-[11px] text-muted-foreground">{noteProgress(n).done}/{noteProgress(n).total} tasks</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider opacity-85">{icon}{label}</div>
      <div className="font-extrabold text-xl tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-sm text-muted-foreground py-6 text-center">{text}</div>;
}

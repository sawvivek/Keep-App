import { useState } from "react";
import { useStore } from "@/lib/store";
import { Tag, Plus, X } from "lucide-react";

interface Props { activeLabel: string | null; setActiveLabel: (l: string | null) => void }

export function LabelsView({ activeLabel, setActiveLabel }: Props) {
  const { state, addLabel, removeLabel } = useStore();
  const [input, setInput] = useState("");

  const counts = state.labels.reduce<Record<string, number>>((acc, l) => {
    acc[l] = state.notes.filter(n => !n.archived && n.label === l).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-border bg-card p-4 note-shadow">
        <h3 className="font-bold mb-2">Create label</h3>
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { addLabel(input); setInput(""); } }}
              className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Side projects"
            className="flex-1 h-10 px-3 rounded-xl bg-secondary outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
          <button className="px-4 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-1 text-sm hover:bg-primary/90">
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card p-2 note-shadow">
        <button
          onClick={() => setActiveLabel(null)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeLabel === null ? "bg-primary/12 text-primary" : "hover:bg-secondary text-foreground"}`}
        >
          <span className="inline-flex items-center gap-2"><Tag size={15} /> All labels</span>
          <span className="text-xs text-muted-foreground tabular-nums">{state.notes.filter(n => !n.archived).length}</span>
        </button>
        {state.labels.map(l => (
          <div key={l} className="group flex items-stretch">
            <button
              onClick={() => setActiveLabel(l)}
              className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeLabel === l ? "bg-primary/12 text-primary" : "hover:bg-secondary text-foreground"}`}
            >
              <span className="inline-flex items-center gap-2"><Tag size={15} /> {l}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{counts[l] ?? 0}</span>
            </button>
            <button
              onClick={() => removeLabel(l)}
              className="opacity-0 group-hover:opacity-100 px-2 text-muted-foreground hover:text-destructive transition"
              title="Delete label"
            >
              <X size={15} />
            </button>
          </div>
        ))}
        {state.labels.length === 0 && (
          <div className="text-sm text-muted-foreground py-6 text-center">No labels yet.</div>
        )}
      </div>
    </div>
  );
}

import { Note, noteBgClass, noteProgress } from "@/lib/types";
import { ProgressRing } from "./ProgressRing";
import { Pin, Calendar, ListChecks } from "lucide-react";

interface Props { note: Note; onClick: () => void; onPin: (e: React.MouseEvent) => void }

function dueBadge(due: string | null) {
  if (!due) return null;
  const ms = new Date(due).getTime() - Date.now();
  const days = Math.ceil(ms / 86400000);
  if (days < 0) return { text: "Overdue!", cls: "bg-destructive/15 text-destructive border-destructive/30" };
  if (days === 0) return { text: "Due today", cls: "bg-warning/20 text-warning border-warning/40" };
  if (days <= 3) return { text: `Due in ${days}d`, cls: "bg-warning/15 text-warning border-warning/30" };
  return { text: `Due in ${days}d`, cls: "bg-muted text-muted-foreground border-border" };
}

export function NoteCard({ note, onClick, onPin }: Props) {
  const { pct, done, total } = noteProgress(note);
  const badge = dueBadge(note.dueDate);
  const preview = note.content.slice(0, 160);
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-2xl border border-border/60 ${noteBgClass(note.color)} note-shadow p-3.5 transition-all hover:-translate-y-0.5 hover:pop-shadow animate-fade-in`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-bold text-card-foreground text-[15px] leading-snug line-clamp-2 flex-1">
          {note.title || <span className="text-muted-foreground italic font-normal">Untitled</span>}
        </h3>
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onPin(e); }}
          className={`shrink-0 rounded-full p-1.5 transition ${note.pinned ? "text-primary bg-primary/10" : "text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:bg-foreground/5"}`}
          aria-label="Pin note"
        >
          <Pin size={14} fill={note.pinned ? "currentColor" : "none"} />
        </span>
      </div>

      {preview && (
        <p className="text-[13px] text-card-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-4 mb-2">
          {preview}
        </p>
      )}

      {note.checklist.length > 0 && (
        <div className="space-y-1 mb-2">
          {note.checklist.slice(0, 4).map(i => (
            <div key={i.id} className="flex items-center gap-2 text-[12.5px]">
              <span className={`size-3.5 shrink-0 rounded-[5px] border ${i.done ? "bg-primary border-primary" : "border-foreground/30"} grid place-items-center`}>
                {i.done && <svg viewBox="0 0 16 16" className="text-primary-foreground" width="9" height="9"><path fill="currentColor" d="M6.2 11L2.5 7.3l1-1L6.2 9l6.3-6.3 1 1z"/></svg>}
              </span>
              <span className={`truncate ${i.done ? "line-through text-card-foreground/50" : "text-card-foreground/85"}`}>{i.text}</span>
            </div>
          ))}
          {note.checklist.length > 4 && (
            <div className="text-[11px] text-card-foreground/60 pl-5.5">+{note.checklist.length - 4} more</div>
          )}
        </div>
      )}

      <div className="flex items-end justify-between gap-2 mt-2">
        <div className="flex flex-wrap gap-1.5 items-center min-h-[20px]">
          {note.label && (
            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-foreground/8 text-card-foreground/75 border border-foreground/10">
              {note.label}
            </span>
          )}
          {badge && (
            <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${badge.cls}`}>
              <Calendar size={10} /> {badge.text}
            </span>
          )}
          {total > 0 && (
            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-foreground/5 text-card-foreground/70 inline-flex items-center gap-1">
              <ListChecks size={10} /> {done}/{total}
            </span>
          )}
        </div>
        {total > 0 && <ProgressRing value={pct} size={42} stroke={4} />}
      </div>
    </button>
  );
}

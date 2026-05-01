import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Note, NOTE_COLORS, NoteColor, noteBgClass, noteProgress } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Pin, Archive, Trash2, Calendar as CalendarIcon, Tag, Plus, X, Palette, ArchiveRestore } from "lucide-react";
import { Confetti } from "./Confetti";

interface Props { noteId: string | null; onClose: () => void; onComplete100: () => void }

export function NoteEditor({ noteId, onClose, onComplete100 }: Props) {
  const { state, updateNote, deleteNote, togglePin, toggleArchive, setColor,
          addChecklistItem, toggleChecklistItem, removeChecklistItem, updateChecklistItem,
          addLabel } = useStore();
  const note = state.notes.find(n => n.id === noteId) ?? null;
  const [newItem, setNewItem] = useState("");
  const [showColors, setShowColors] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [confettiKey, setConfettiKey] = useState(0);
  const prevPct = useRef<number>(note ? noteProgress(note).pct : 0);

  useEffect(() => {
    if (!note) return;
    const { pct } = noteProgress(note);
    if (pct === 100 && prevPct.current < 100) {
      setConfettiKey(Date.now());
      onComplete100();
    }
    prevPct.current = pct;
  }, [note, onComplete100]);

  if (!note) return null;
  const { pct, done, total } = noteProgress(note);
  const sortedChecklist = [...note.checklist].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <Dialog open={!!noteId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={`p-0 gap-0 max-w-2xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[90vh] overflow-hidden border-border ${noteBgClass(note.color)} rounded-2xl`}
      >
        <Confetti trigger={confettiKey} />

        {/* Progress bar */}
        {total > 0 && (
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between text-[12px] font-medium text-card-foreground/80 mb-1.5">
              <span>{done} of {total} tasks done</span>
              <span className="tabular-nums">{pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100 ? "hsl(var(--success))" :
                              pct >= 66  ? "linear-gradient(90deg, hsl(142 60% 45%), hsl(142 60% 55%))" :
                              pct >= 33  ? "linear-gradient(90deg, hsl(30 95% 55%), hsl(45 95% 55%))" :
                                           "linear-gradient(90deg, hsl(8 85% 60%), hsl(20 90% 60%))",
                }}
              />
            </div>
          </div>
        )}

        <div className="px-5 pt-4 pb-2 overflow-y-auto max-h-[60vh]">
          <input
            value={note.title}
            onChange={(e) => updateNote(note.id, { title: e.target.value })}
            placeholder="Title"
            className="w-full bg-transparent outline-none font-bold text-xl text-card-foreground placeholder:text-card-foreground/40 mb-2"
          />
          <textarea
            value={note.content}
            onChange={(e) => updateNote(note.id, { content: e.target.value })}
            placeholder="Take a note..."
            rows={3}
            className="w-full bg-transparent outline-none resize-none text-[14px] text-card-foreground/90 placeholder:text-card-foreground/40 leading-relaxed"
          />

          {/* Checklist */}
          <div className="mt-3 space-y-1.5">
            {sortedChecklist.map(i => (
              <div key={i.id} className="group/item flex items-center gap-2.5">
                <button
                  onClick={() => toggleChecklistItem(note.id, i.id)}
                  className={`size-5 shrink-0 rounded-md border-2 grid place-items-center transition ${i.done ? "bg-primary border-primary" : "border-foreground/35 hover:border-primary"}`}
                >
                  {i.done && <svg viewBox="0 0 16 16" className="text-primary-foreground" width="12" height="12"><path fill="currentColor" d="M6.2 11L2.5 7.3l1-1L6.2 9l6.3-6.3 1 1z"/></svg>}
                </button>
                <input
                  value={i.text}
                  onChange={(e) => updateChecklistItem(note.id, i.id, e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-[14px] ${i.done ? "line-through text-card-foreground/50" : "text-card-foreground"}`}
                />
                <button
                  onClick={() => removeChecklistItem(note.id, i.id)}
                  className="opacity-0 group-hover/item:opacity-100 text-card-foreground/50 hover:text-destructive transition"
                  aria-label="Remove item"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
            <form
              onSubmit={(e) => { e.preventDefault(); addChecklistItem(note.id, newItem); setNewItem(""); }}
              className="flex items-center gap-2.5 pt-1"
            >
              <Plus size={16} className="text-card-foreground/50" />
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add task"
                className="flex-1 bg-transparent outline-none text-[14px] text-card-foreground placeholder:text-card-foreground/45"
              />
            </form>
          </div>

          {/* meta */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {note.label && (
              <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-foreground/10 text-card-foreground/85 inline-flex items-center gap-1">
                <Tag size={11} /> {note.label}
                <button onClick={() => updateNote(note.id, { label: null })} className="ml-1 opacity-60 hover:opacity-100"><X size={11} /></button>
              </span>
            )}
            {note.dueDate && (
              <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-foreground/10 text-card-foreground/85 inline-flex items-center gap-1">
                <CalendarIcon size={11} /> {new Date(note.dueDate).toLocaleDateString()}
                <button onClick={() => updateNote(note.id, { dueDate: null })} className="ml-1 opacity-60 hover:opacity-100"><X size={11} /></button>
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-t border-foreground/10 bg-card/40 backdrop-blur-sm px-3 py-2 flex items-center gap-1 flex-wrap">
          <ToolBtn label={note.pinned ? "Unpin" : "Pin"} onClick={() => togglePin(note.id)} active={note.pinned}>
            <Pin size={16} fill={note.pinned ? "currentColor" : "none"} />
          </ToolBtn>

          <div className="relative">
            <ToolBtn label="Color" onClick={() => { setShowColors(v => !v); setShowLabels(false); }} active={showColors}>
              <Palette size={16} />
            </ToolBtn>
            {showColors && (
              <div className="absolute bottom-full left-0 mb-2 z-10 bg-popover border border-border rounded-xl p-2 shadow-lg flex flex-wrap gap-1.5 w-[228px] animate-scale-in">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.key}
                    onClick={() => { setColor(note.id, c.key as NoteColor); setShowColors(false); }}
                    className={`size-7 rounded-full border-2 ${noteBgClass(c.key as NoteColor)} ${note.color === c.key ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <ToolBtn label="Label" onClick={() => { setShowLabels(v => !v); setShowColors(false); }} active={showLabels}>
              <Tag size={16} />
            </ToolBtn>
            {showLabels && (
              <div className="absolute bottom-full left-0 mb-2 z-10 bg-popover border border-border rounded-xl p-2 shadow-lg w-[220px] animate-scale-in">
                <div className="max-h-44 overflow-y-auto">
                  {state.labels.map(l => (
                    <button
                      key={l}
                      onClick={() => { updateNote(note.id, { label: l }); setShowLabels(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-[13px] hover:bg-secondary ${note.label === l ? "text-primary font-semibold" : "text-popover-foreground"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (labelInput.trim()) { addLabel(labelInput); updateNote(note.id, { label: labelInput.trim() }); setLabelInput(""); setShowLabels(false); } }}
                      className="mt-1 flex gap-1 border-t border-border pt-2">
                  <input
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="New label"
                    className="flex-1 bg-secondary/50 rounded-md px-2 py-1 text-[12.5px] outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button className="px-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold">Add</button>
                </form>
              </div>
            )}
          </div>

          <label className="inline-flex items-center justify-center size-9 rounded-full hover:bg-foreground/10 cursor-pointer text-card-foreground/80" title="Due date">
            <CalendarIcon size={16} />
            <input
              type="date"
              className="sr-only"
              value={note.dueDate ? note.dueDate.slice(0, 10) : ""}
              onChange={(e) => updateNote(note.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </label>

          <ToolBtn label={note.archived ? "Unarchive" : "Archive"} onClick={() => { toggleArchive(note.id); onClose(); }}>
            {note.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          </ToolBtn>

          <ToolBtn label="Delete" onClick={() => { deleteNote(note.id); onClose(); }}>
            <Trash2 size={16} className="text-destructive" />
          </ToolBtn>

          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 rounded-full bg-foreground/85 text-background text-[13px] font-semibold hover:bg-foreground transition"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToolBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center size-9 rounded-full transition ${active ? "bg-primary/15 text-primary" : "text-card-foreground/80 hover:bg-foreground/10"}`}
    >
      {children}
    </button>
  );
}

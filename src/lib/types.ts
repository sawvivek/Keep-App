export type NoteColor =
  | "default" | "coral" | "peach" | "sand" | "mint"
  | "sage" | "sky" | "lavender" | "pink" | "stone" | "slate";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  label: string | null;
  pinned: boolean;
  archived: boolean;
  dueDate: string | null; // ISO date
  createdAt: string;
  updatedAt: string;
  checklist: ChecklistItem[];
}

export interface AppState {
  notes: Note[];
  labels: string[];
  streak: { count: number; lastDay: string | null };
  theme: "light" | "dark";
}

export const NOTE_COLORS: { key: NoteColor; name: string; cls: string }[] = [
  { key: "default",   name: "Default",   cls: "bg-note-default" },
  { key: "coral",     name: "Coral",     cls: "bg-note-coral" },
  { key: "peach",     name: "Peach",     cls: "bg-note-peach" },
  { key: "sand",      name: "Sand",      cls: "bg-note-sand" },
  { key: "mint",      name: "Mint",      cls: "bg-note-mint" },
  { key: "sage",      name: "Sage",      cls: "bg-note-sage" },
  { key: "sky",       name: "Sky",       cls: "bg-note-sky" },
  { key: "lavender",  name: "Lavender",  cls: "bg-note-lavender" },
  { key: "pink",      name: "Pink",      cls: "bg-note-pink" },
  { key: "stone",     name: "Stone",     cls: "bg-note-stone" },
  { key: "slate",     name: "Slate",     cls: "bg-note-slate" },
];

export function noteBgClass(c: NoteColor) {
  return NOTE_COLORS.find(x => x.key === c)?.cls ?? "bg-note-default";
}

export function noteProgress(n: Note): { pct: number; done: number; total: number } {
  const total = n.checklist.length;
  const done = n.checklist.filter(i => i.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { pct, done, total };
}

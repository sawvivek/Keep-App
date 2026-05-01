import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AppState, Note, NoteColor } from "./types";

const STORAGE_KEY = "keepgrowing.v1";

const SEED_NOTES: Note[] = [
  {
    id: "seed-1",
    title: "Launch personal blog 🌱",
    content: "Spin up the very first version of my writing space.",
    color: "mint",
    label: "Personal",
    pinned: true,
    archived: false,
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: "a", text: "Pick a domain name", done: true },
      { id: "b", text: "Choose theme & colors", done: true },
      { id: "c", text: "Write first post", done: false },
      { id: "d", text: "Set up newsletter", done: false },
    ],
  },
  {
    id: "seed-2",
    title: "Morning routine",
    content: "Build a sustainable, energizing start to the day.",
    color: "peach",
    label: "Health",
    pinned: false,
    archived: false,
    dueDate: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: "a", text: "Drink a glass of water", done: true },
      { id: "b", text: "10 min stretch", done: true },
      { id: "c", text: "Read for 15 min", done: true },
    ],
  },
  {
    id: "seed-3",
    title: "Read “Atomic Habits”",
    content: "Take notes on each chapter and try one habit weekly.",
    color: "lavender",
    label: "Study",
    pinned: false,
    archived: false,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: "a", text: "Chapters 1-3", done: true },
      { id: "b", text: "Chapters 4-6", done: false },
      { id: "c", text: "Chapters 7-9", done: false },
      { id: "d", text: "Chapters 10-12", done: false },
      { id: "e", text: "Final reflection", done: false },
    ],
  },
];

const DEFAULT_STATE: AppState = {
  notes: SEED_NOTES,
  labels: ["Work", "Personal", "Study", "Health", "Ideas"],
  streak: { count: 1, lastDay: new Date().toDateString() },
  theme: "light",
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state: AppState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

interface StoreCtx {
  state: AppState;
  addNote: (partial?: Partial<Note>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  setColor: (id: string, color: NoteColor) => void;
  addChecklistItem: (id: string, text: string) => void;
  toggleChecklistItem: (noteId: string, itemId: string) => void;
  removeChecklistItem: (noteId: string, itemId: string) => void;
  updateChecklistItem: (noteId: string, itemId: string, text: string) => void;
  addLabel: (label: string) => void;
  removeLabel: (label: string) => void;
  setTheme: (t: "light" | "dark") => void;
  exportJSON: () => string;
  bumpStreakIfTaskCompleted: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load());

  useEffect(() => { save(state); }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [state.theme]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(prev => fn(prev)), []);

  const addNote: StoreCtx["addNote"] = useCallback((partial = {}) => {
    const now = new Date().toISOString();
    const note: Note = {
      id: uid(),
      title: "",
      content: "",
      color: "default",
      label: null,
      pinned: false,
      archived: false,
      dueDate: null,
      createdAt: now,
      updatedAt: now,
      checklist: [],
      ...partial,
    };
    update(s => ({ ...s, notes: [note, ...s.notes] }));
    return note;
  }, [update]);

  const updateNote: StoreCtx["updateNote"] = useCallback((id, patch) => {
    update(s => ({
      ...s,
      notes: s.notes.map(n => n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n),
    }));
  }, [update]);

  const deleteNote = useCallback((id: string) => {
    update(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
  }, [update]);

  const togglePin = useCallback((id: string) => {
    update(s => ({ ...s, notes: s.notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n) }));
  }, [update]);

  const toggleArchive = useCallback((id: string) => {
    update(s => ({ ...s, notes: s.notes.map(n => n.id === id ? { ...n, archived: !n.archived, pinned: false } : n) }));
  }, [update]);

  const setColor = useCallback((id: string, color: NoteColor) => {
    update(s => ({ ...s, notes: s.notes.map(n => n.id === id ? { ...n, color } : n) }));
  }, [update]);

  const addChecklistItem = useCallback((id: string, text: string) => {
    if (!text.trim()) return;
    update(s => ({
      ...s,
      notes: s.notes.map(n => n.id === id
        ? { ...n, checklist: [...n.checklist, { id: uid(), text: text.trim(), done: false }], updatedAt: new Date().toISOString() }
        : n),
    }));
  }, [update]);

  const bumpStreakIfTaskCompleted = useCallback(() => {
    update(s => {
      const today = new Date().toDateString();
      const last = s.streak.lastDay;
      if (last === today) return s;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const count = last === yesterday ? s.streak.count + 1 : 1;
      return { ...s, streak: { count, lastDay: today } };
    });
  }, [update]);

  const toggleChecklistItem = useCallback((noteId: string, itemId: string) => {
    let becameDone = false;
    update(s => ({
      ...s,
      notes: s.notes.map(n => {
        if (n.id !== noteId) return n;
        const checklist = n.checklist.map(i => {
          if (i.id === itemId) {
            if (!i.done) becameDone = true;
            return { ...i, done: !i.done };
          }
          return i;
        });
        return { ...n, checklist, updatedAt: new Date().toISOString() };
      }),
    }));
    if (becameDone) {
      // streak bump
      setTimeout(() => bumpStreakIfTaskCompleted(), 0);
    }
  }, [update, bumpStreakIfTaskCompleted]);

  const removeChecklistItem = useCallback((noteId: string, itemId: string) => {
    update(s => ({
      ...s,
      notes: s.notes.map(n => n.id === noteId ? { ...n, checklist: n.checklist.filter(i => i.id !== itemId) } : n),
    }));
  }, [update]);

  const updateChecklistItem = useCallback((noteId: string, itemId: string, text: string) => {
    update(s => ({
      ...s,
      notes: s.notes.map(n => n.id === noteId
        ? { ...n, checklist: n.checklist.map(i => i.id === itemId ? { ...i, text } : i) }
        : n),
    }));
  }, [update]);

  const addLabel = useCallback((label: string) => {
    const t = label.trim();
    if (!t) return;
    update(s => s.labels.includes(t) ? s : { ...s, labels: [...s.labels, t] });
  }, [update]);

  const removeLabel = useCallback((label: string) => {
    update(s => ({
      ...s,
      labels: s.labels.filter(l => l !== label),
      notes: s.notes.map(n => n.label === label ? { ...n, label: null } : n),
    }));
  }, [update]);

  const setTheme = useCallback((t: "light" | "dark") => update(s => ({ ...s, theme: t })), [update]);

  const exportJSON = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const value = useMemo<StoreCtx>(() => ({
    state, addNote, updateNote, deleteNote, togglePin, toggleArchive, setColor,
    addChecklistItem, toggleChecklistItem, removeChecklistItem, updateChecklistItem,
    addLabel, removeLabel, setTheme, exportJSON, bumpStreakIfTaskCompleted,
  }), [state, addNote, updateNote, deleteNote, togglePin, toggleArchive, setColor,
       addChecklistItem, toggleChecklistItem, removeChecklistItem, updateChecklistItem,
       addLabel, removeLabel, setTheme, exportJSON, bumpStreakIfTaskCompleted]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

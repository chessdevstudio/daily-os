"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import Pomodoro from "@/components/Pomodoro";

type Status = "TODO" | "DOING" | "DONE";
type Task = { id: string; title: string; status: Status };

const COLUMNS: { key: Status; label: string }[] = [
  { key: "TODO", label: "À faire" },
  { key: "DOING", label: "En cours" },
  { key: "DONE", label: "Fait" },
];

export default function FocusPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeCol, setActiveCol] = useState<Status>("TODO");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then((d) => {
      setTasks(d.tasks ?? []);
      setLoading(false);
    });
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setTasks((s) => [...s, data.task]);
      setTitle("");
      setActiveCol("TODO");
    }
  }

  async function moveTask(id: string, status: Status) {
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, status } : t)));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function deleteTask(id: string) {
    setTasks((s) => s.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  if (loading) return null;

  return (
    <div>
      <TopBar title="Focus" />
      <main className="max-w-md mx-auto px-5 flex flex-col gap-5 mt-2 animate-fadeIn">
        <Pomodoro />

        <form onSubmit={addTask} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Nouvelle tâche..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary px-4">Ajouter</button>
        </form>

        {/* Sélecteur de colonne (mobile) */}
        <div className="flex gap-2 sm:hidden">
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCol(c.key)}
              className={`flex-1 text-xs font-semibold py-2 rounded-full border ${
                activeCol === c.key ? "bg-ink text-white border-ink" : "border-line text-mute"
              }`}
            >
              {c.label} ({tasks.filter((t) => t.status === c.key).length})
            </button>
          ))}
        </div>

        {/* Colonnes : empilées sur mobile (une visible), grille sur sm+ */}
        <div className="grid sm:grid-cols-3 gap-3">
          {COLUMNS.map((c) => (
            <div key={c.key} className={c.key === activeCol ? "block" : "hidden sm:block"}>
              <div className="label mb-2 hidden sm:block">{c.label}</div>
              <div className="flex flex-col gap-2 min-h-[80px]">
                {tasks.filter((t) => t.status === c.key).length === 0 && (
                  <p className="text-xs text-mute py-2">Vide.</p>
                )}
                {tasks.filter((t) => t.status === c.key).map((t) => (
                  <TaskCard key={t.id} task={t} onMove={moveTask} onDelete={deleteTask} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function TaskCard({
  task, onMove, onDelete,
}: { task: Task; onMove: (id: string, s: Status) => void; onDelete: (id: string) => void }) {
  const idx = COLUMNS.findIndex((c) => c.key === task.status);
  const prev = COLUMNS[idx - 1];
  const next = COLUMNS[idx + 1];

  return (
    <div className="card p-3">
      <p className="text-sm mb-2">{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {prev && (
            <button
              onClick={() => onMove(task.id, prev.key)}
              className="text-xs text-mute border border-line rounded-full w-7 h-7"
              aria-label={`Déplacer vers ${prev.label}`}
            >
              ←
            </button>
          )}
          {next && (
            <button
              onClick={() => onMove(task.id, next.key)}
              className="text-xs text-mute border border-line rounded-full w-7 h-7"
              aria-label={`Déplacer vers ${next.label}`}
            >
              →
            </button>
          )}
        </div>
        <button onClick={() => onDelete(task.id)} className="text-mute text-lg leading-none" aria-label="Supprimer">
          ×
        </button>
      </div>
    </div>
  );
}

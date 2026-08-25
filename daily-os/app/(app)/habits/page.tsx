"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { todayKey, monthGrid, MONTH_LABELS, WEEKDAY_LABELS } from "@/lib/dates";

type Habit = { id: string; name: string; emoji: string; logs: { date: string }[] };

const EMOJIS = ["🏃", "📚", "💧", "🧘", "🥗", "😴", "✍️", "🎯"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(todayKey());
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const d = await fetch("/api/habits").then((r) => r.json());
    setHabits(d.habits ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(habitId: string, date: string) {
    setHabits((s) => s.map((h) => {
      if (h.id !== habitId) return h;
      const has = h.logs.some((l) => l.date === date);
      return { ...h, logs: has ? h.logs.filter((l) => l.date !== date) : [...h.logs, { date }] };
    }));
    await fetch(`/api/habits/${habitId}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });
  }

  async function remove(habitId: string) {
    setHabits((s) => s.filter((h) => h.id !== habitId));
    await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
  }

  if (loading) return null;

  const [year, month] = cursor.split("-").map(Number);
  const cells = monthGrid(cursor);
  const today = todayKey();

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
  }

  return (
    <div>
      <TopBar title="Habitudes" />
      <main className="max-w-md mx-auto px-5 flex flex-col gap-5 mt-2 animate-fadeIn">
        {habits.length < 3 && (
          <button onClick={() => setShowForm((s) => !s)} className="btn btn-ghost">
            {showForm ? "Annuler" : "+ Nouvelle habitude"}
          </button>
        )}
        {showForm && <NewHabitForm onCreated={(h) => { setHabits((s) => [...s, h]); setShowForm(false); }} />}

        {habits.length === 0 && !showForm && (
          <p className="text-sm text-mute">Crée jusqu'à 3 habitudes (sport, lecture, eau...) à cocher chaque jour.</p>
        )}

        {habits.map((h) => (
          <section key={h.id} className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{h.emoji} {h.name}</span>
              <button onClick={() => remove(h.id)} className="text-mute text-xs underline">Supprimer</button>
            </div>
            <p className="text-xs text-mute mb-3">
              {h.logs.length} jour{h.logs.length > 1 ? "s" : ""} coché{h.logs.length > 1 ? "s" : ""} au total
            </p>

            <div className="flex items-center justify-between mb-2">
              <button onClick={() => shiftMonth(-1)} className="text-mute px-2" aria-label="Mois précédent">‹</button>
              <span className="text-xs font-semibold">{MONTH_LABELS[month - 1]} {year}</span>
              <button onClick={() => shiftMonth(1)} className="text-mute px-2" aria-label="Mois suivant">›</button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAY_LABELS.map((w, i) => (
                <div key={i} className="text-center text-[10px] text-mute">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const done = h.logs.some((l) => l.date === date);
                const isToday = date === today;
                const isFuture = date > today;
                return (
                  <button
                    key={date}
                    disabled={isFuture}
                    onClick={() => toggle(h.id, date)}
                    className={`aspect-square rounded-md text-[11px] flex items-center justify-center
                      ${done ? "bg-ink text-white" : "bg-[#F5F5F3] text-ink"}
                      ${isToday ? "ring-1 ring-ink ring-offset-1" : ""}
                      ${isFuture ? "opacity-30" : ""}
                    `}
                  >
                    {Number(date.slice(-2))}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function NewHabitForm({ onCreated }: { onCreated: (h: Habit) => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), emoji }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    onCreated(data.habit);
    setName("");
  }

  return (
    <form onSubmit={submit} className="card p-4 flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {EMOJIS.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => setEmoji(e)}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg ${
              emoji === e ? "border-ink bg-[#F5F5F3]" : "border-line"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <input
        className="input"
        placeholder="Ex : Sport, Lecture, Eau..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? "..." : "Créer l'habitude"}
      </button>
    </form>
  );
}

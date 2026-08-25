"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { todayKey } from "@/lib/dates";

type Profile = { targetKcal: number } | null;
type MealLog = { id: string; name: string; kcal: number };
type Task = { id: string; status: string };
type Habit = { id: string; name: string; emoji: string; logs: { date: string }[] };

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>(null);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const today = todayKey();

  useEffect(() => {
    async function load() {
      const [p, l, t, h] = await Promise.all([
        fetch("/api/nutrition/profile").then((r) => r.json()),
        fetch(`/api/nutrition/logs?date=${today}`).then((r) => r.json()),
        fetch("/api/tasks").then((r) => r.json()),
        fetch("/api/habits").then((r) => r.json()),
      ]);
      setProfile(p.profile);
      setLogs(l.logs ?? []);
      setTasks(t.tasks ?? []);
      setHabits(h.habits ?? []);
      setLoading(false);
    }
    load();
  }, [today]);

  const consumed = logs.reduce((s, l) => s + l.kcal, 0);
  const target = profile?.targetKcal ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;

  const todo = tasks.filter((t) => t.status === "TODO").length;
  const doing = tasks.filter((t) => t.status === "DOING").length;
  const done = tasks.filter((t) => t.status === "DONE").length;

  const doneToday = habits.filter((h) => h.logs.some((l) => l.date === today)).length;

  if (loading) return <Skeleton />;

  return (
    <div>
      <TopBar title="Aujourd'hui" />
      <main className="max-w-md mx-auto px-5 flex flex-col gap-4 mt-2 animate-fadeIn">
        {/* Nutrition */}
        <Link href="/nutrition" className="card p-4 block">
          <div className="flex items-center justify-between mb-2">
            <span className="label">Nutrition</span>
            <span className="text-xs text-mute">{pct}%</span>
          </div>
          {profile ? (
            <>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold tabular">{Math.round(consumed)}</span>
                <span className="text-mute text-sm">/ {Math.round(target)} kcal</span>
              </div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
            </>
          ) : (
            <p className="text-sm text-mute">Configure ton profil pour calculer ton besoin en kcal →</p>
          )}
        </Link>

        {/* Focus */}
        <Link href="/focus" className="card p-4 block">
          <div className="flex items-center justify-between mb-3">
            <span className="label">Focus & devoirs</span>
            <span className="text-xs text-mute">{done}/{todo + doing + done} faits</span>
          </div>
          <div className="flex gap-4 text-sm">
            <Stat n={todo} label="À faire" />
            <Stat n={doing} label="En cours" />
            <Stat n={done} label="Fait" />
          </div>
        </Link>

        {/* Habits */}
        <Link href="/habits" className="card p-4 block">
          <div className="flex items-center justify-between mb-3">
            <span className="label">Habitudes</span>
            <span className="text-xs text-mute">{doneToday}/{habits.length} aujourd'hui</span>
          </div>
          {habits.length === 0 ? (
            <p className="text-sm text-mute">Crée jusqu'à 3 habitudes à suivre chaque jour →</p>
          ) : (
            <div className="flex gap-2">
              {habits.map((h) => {
                const doneH = h.logs.some((l) => l.date === today);
                return (
                  <div
                    key={h.id}
                    className={`flex-1 rounded-lg py-3 text-center border ${doneH ? "bg-ink text-white border-ink" : "border-line text-mute"}`}
                  >
                    <div className="text-lg leading-none mb-1">{h.emoji}</div>
                    <div className="text-[11px] truncate px-1">{h.name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Link>
      </main>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-lg font-bold tabular">{n}</div>
      <div className="text-[11px] text-mute">{label}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-md mx-auto px-5 pt-6">
      <div className="h-6 w-32 bg-line rounded animate-pulse mb-6" />
      <div className="h-28 bg-line/50 rounded-lg animate-pulse mb-4" />
      <div className="h-28 bg-line/50 rounded-lg animate-pulse mb-4" />
      <div className="h-28 bg-line/50 rounded-lg animate-pulse" />
    </div>
  );
}

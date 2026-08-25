"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { todayKey } from "@/lib/dates";
import { ACTIVITY_LABELS, ActivityLevel } from "@/lib/nutrition";

type Profile = {
  age: number; heightCm: number; weightKg: number;
  sex: "M" | "F"; activityLevel: ActivityLevel; targetKcal: number;
} | null;

type MealLog = { id: string; name: string; kcal: number };

export default function NutritionPage() {
  const [profile, setProfile] = useState<Profile>(null);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const today = todayKey();

  async function loadAll() {
    const [p, l] = await Promise.all([
      fetch("/api/nutrition/profile").then((r) => r.json()),
      fetch(`/api/nutrition/logs?date=${today}`).then((r) => r.json()),
    ]);
    setProfile(p.profile);
    setLogs(l.logs ?? []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return null;

  if (!profile || editing) {
    return (
      <div>
        <TopBar title="Nutrition" />
        <ProfileForm
          initial={profile}
          onSaved={() => { setEditing(false); loadAll(); }}
        />
      </div>
    );
  }

  const consumed = logs.reduce((s, l) => s + l.kcal, 0);
  const pct = Math.min(100, Math.round((consumed / profile.targetKcal) * 100));
  const remaining = Math.round(profile.targetKcal - consumed);

  return (
    <div>
      <TopBar title="Nutrition" />
      <main className="max-w-md mx-auto px-5 flex flex-col gap-5 mt-2 animate-fadeIn">
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="label">Aujourd'hui</span>
            <button onClick={() => setEditing(true)} className="text-xs font-semibold text-mute underline">
              Modifier mon profil
            </button>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular">{Math.round(consumed)}</span>
            <span className="text-mute text-sm">/ {Math.round(profile.targetKcal)} kcal</span>
          </div>
          <div className="bar-track mt-3"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
          <p className="text-xs text-mute mt-2">
            {remaining >= 0 ? `${remaining} kcal restantes` : `${Math.abs(remaining)} kcal au-dessus de l'objectif`}
          </p>
        </section>

        <MealForm date={today} onAdded={(log) => setLogs((s) => [...s, log])} />

        <section className="flex flex-col gap-2">
          <span className="label">Repas du jour</span>
          {logs.length === 0 && <p className="text-sm text-mute">Aucun repas enregistré pour l'instant.</p>}
          {logs.map((l) => (
            <div key={l.id} className="card p-3 flex items-center justify-between">
              <span className="text-sm">{l.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular">{Math.round(l.kcal)} kcal</span>
                <button
                  aria-label={`Supprimer ${l.name}`}
                  onClick={async () => {
                    setLogs((s) => s.filter((x) => x.id !== l.id));
                    await fetch(`/api/nutrition/logs/${l.id}`, { method: "DELETE" });
                  }}
                  className="text-mute text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function MealForm({ date, onAdded }: { date: string; onAdded: (l: MealLog) => void }) {
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const kcalNum = Number(kcal);
    if (!name.trim() || !kcalNum || kcalNum <= 0) {
      setError("Renseigne un nom et des kcal valides.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/nutrition/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), kcal: kcalNum, date }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    onAdded(data.log);
    setName(""); setKcal("");
  }

  return (
    <form onSubmit={submit} className="card p-4 flex flex-col gap-2">
      <span className="label">Ajouter un repas</span>
      <div className="flex gap-2">
        <input
          className="input flex-[2]"
          placeholder="Ex : Poulet riz"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input flex-1"
          placeholder="kcal"
          inputMode="numeric"
          value={kcal}
          onChange={(e) => setKcal(e.target.value.replace(/[^0-9]/g, ""))}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? "..." : "Ajouter"}
      </button>
    </form>
  );
}

function ProfileForm({ initial, onSaved }: { initial: Profile; onSaved: () => void }) {
  const [age, setAge] = useState(initial?.age?.toString() ?? "");
  const [heightCm, setHeightCm] = useState(initial?.heightCm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initial?.weightKg?.toString() ?? "");
  const [sex, setSex] = useState<"M" | "F">(initial?.sex ?? "M");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initial?.activityLevel ?? "moderate");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/nutrition/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: Number(age), heightCm: Number(heightCm), weightKg: Number(weightKg), sex, activityLevel,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    onSaved();
  }

  return (
    <main className="max-w-md mx-auto px-5 mt-2 animate-fadeIn">
      <p className="text-sm text-mute mb-4">
        Renseigne ton profil pour calculer ton besoin calorique (formule de Mifflin-St Jeor).
      </p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setSex("M")}
            className={`btn flex-1 ${sex === "M" ? "btn-primary" : "btn-ghost"}`}>Homme</button>
          <button type="button" onClick={() => setSex("F")}
            className={`btn flex-1 ${sex === "F" ? "btn-primary" : "btn-ghost"}`}>Femme</button>
        </div>
        <div>
          <label className="label">Âge</label>
          <input className="input mt-1" inputMode="numeric" value={age}
            onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Ex : 28" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">Taille (cm)</label>
            <input className="input mt-1" inputMode="numeric" value={heightCm}
              onChange={(e) => setHeightCm(e.target.value.replace(/[^0-9]/g, ""))} placeholder="175" />
          </div>
          <div className="flex-1">
            <label className="label">Poids (kg)</label>
            <input className="input mt-1" inputMode="numeric" value={weightKg}
              onChange={(e) => setWeightKg(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="70" />
          </div>
        </div>
        <div>
          <label className="label">Niveau d'activité</label>
          <select
            className="input mt-1"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          >
            {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={saving} className="btn btn-primary mt-2">
          {saving ? "..." : "Calculer mon besoin en kcal"}
        </button>
      </form>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export default function Pomodoro() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            const nextMode = mode === "focus" ? "break" : "focus";
            setMode(nextMode);
            playChime();
            return nextMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  function playChime() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // audio non disponible, on ignore silencieusement
    }
  }

  function reset(newMode: "focus" | "break" = mode) {
    setRunning(false);
    setMode(newMode);
    setSecondsLeft(newMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
  }

  const total = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const pct = Math.round(((total - secondsLeft) / total) * 100);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <section className="card p-5 flex flex-col items-center">
      <div className="flex gap-2 mb-4">
        <ModeTab label="Focus 25" active={mode === "focus"} onClick={() => reset("focus")} />
        <ModeTab label="Pause 5" active={mode === "break"} onClick={() => reset("break")} />
      </div>

      <div className={`text-6xl font-bold tabular tracking-tight mb-4 ${running ? "animate-pulseRing" : ""}`}>
        {mm}:{ss}
      </div>

      <div className="bar-track w-full mb-5">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex gap-2 w-full">
        <button onClick={() => setRunning((r) => !r)} className="btn btn-primary flex-1">
          {running ? "Pause" : "Démarrer"}
        </button>
        <button onClick={() => reset()} className="btn btn-ghost flex-1">
          Réinitialiser
        </button>
      </div>
    </section>
  );
}

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
        active ? "bg-ink text-white border-ink" : "border-line text-mute"
      }`}
    >
      {label}
    </button>
  );
}

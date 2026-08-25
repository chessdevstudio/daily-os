"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
      <div className="mb-10">
        <div className="text-2xl font-bold tracking-tight">Daily OS</div>
        <p className="text-mute text-sm mt-1">
          {isLogin ? "Connecte-toi à ton tableau de bord." : "Crée ton compte en 10 secondes."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="input mt-1"
            placeholder="toi@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="input mt-1"
            placeholder="8 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 mt-1">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary mt-3 w-full">
          {loading ? "..." : isLogin ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      <p className="text-sm text-mute mt-6 text-center">
        {isLogin ? (
          <>Pas encore de compte ? <a className="text-ink font-semibold underline" href="/register">S'inscrire</a></>
        ) : (
          <>Déjà un compte ? <a className="text-ink font-semibold underline" href="/login">Se connecter</a></>
        )}
      </p>
    </div>
  );
}

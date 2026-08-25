"use client";

import { useRouter } from "next/navigation";

export default function TopBar({ title }: { title: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="max-w-md mx-auto w-full flex items-center justify-between px-5 pt-6 pb-2">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      <button
        onClick={logout}
        className="text-xs font-semibold text-mute border border-line rounded-full px-3 py-1.5"
      >
        Déconnexion
      </button>
    </header>
  );
}

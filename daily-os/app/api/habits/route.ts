import { NextRequest, NextResponse } from "next/server";
import { countHabits, createHabit, listHabits } from "@/lib/repo";
import { requireUserId } from "@/lib/auth";

const MAX_HABITS = 3;

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const habits = listHabits(userId);
  return NextResponse.json({ habits });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const count = countHabits(userId);
  if (count >= MAX_HABITS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_HABITS} habitudes. Supprime-en une pour en créer une nouvelle.` },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").toString().trim();
  const emoji = (body?.emoji ?? "✓").toString().trim() || "✓";
  if (!name) return NextResponse.json({ error: "Nom requis." }, { status: 400 });

  const habit = createHabit(userId, name, emoji);
  return NextResponse.json({ habit });
}

import { NextRequest, NextResponse } from "next/server";
import { findHabit, toggleHabitLog } from "@/lib/repo";
import { requireUserId } from "@/lib/auth";
import { todayKey } from "@/lib/dates";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const habit = findHabit(params.id);
  if (!habit || habit.user_id !== userId) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const date = (body?.date ?? todayKey()).toString();

  const done = toggleHabitLog(params.id, date);
  return NextResponse.json({ done });
}

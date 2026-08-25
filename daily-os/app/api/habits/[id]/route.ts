import { NextResponse } from "next/server";
import { deleteHabit, findHabit } from "@/lib/repo";
import { requireUserId } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const habit = findHabit(params.id);
  if (!habit || habit.user_id !== userId) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  deleteHabit(params.id);
  return NextResponse.json({ ok: true });
}

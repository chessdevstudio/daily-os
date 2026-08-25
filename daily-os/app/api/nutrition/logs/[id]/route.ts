import { NextResponse } from "next/server";
import { deleteMealLog, findMealLog } from "@/lib/repo";
import { requireUserId } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const log = findMealLog(params.id);
  if (!log || log.user_id !== userId) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  deleteMealLog(params.id);
  return NextResponse.json({ ok: true });
}

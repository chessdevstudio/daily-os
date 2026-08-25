import { NextRequest, NextResponse } from "next/server";
import { deleteTask, findTask, updateTask } from "@/lib/repo";
import { requireUserId } from "@/lib/auth";

const VALID_STATUSES = ["TODO", "DOING", "DONE"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const task = findTask(params.id);
  if (!task || task.user_id !== userId) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const data: { status?: string; title?: string; position?: number } = {};

  if (body?.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body?.title !== undefined) {
    const title = body.title.toString().trim();
    if (!title) return NextResponse.json({ error: "Titre invalide." }, { status: 400 });
    data.title = title;
  }
  if (body?.position !== undefined) {
    data.position = Number(body.position);
  }

  const updated = updateTask(params.id, data);
  return NextResponse.json({ task: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const task = findTask(params.id);
  if (!task || task.user_id !== userId) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  deleteTask(params.id);
  return NextResponse.json({ ok: true });
}

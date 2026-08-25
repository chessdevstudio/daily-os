import { NextRequest, NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/repo";
import { requireUserId } from "@/lib/auth";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const tasks = listTasks(userId);
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = (body?.title ?? "").toString().trim();
  if (!title) return NextResponse.json({ error: "Titre requis." }, { status: 400 });

  const task = createTask(userId, title);
  return NextResponse.json({ task });
}

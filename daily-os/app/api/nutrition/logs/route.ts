import { NextRequest, NextResponse } from "next/server";
import { createMealLog, listMealLogs } from "@/lib/repo";
import { requireUserId } from "@/lib/auth";
import { todayKey } from "@/lib/dates";

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date") ?? todayKey();
  const logs = listMealLogs(userId, date);
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").toString().trim();
  const kcal = Number(body?.kcal);
  const date = (body?.date ?? todayKey()).toString();

  if (!name) return NextResponse.json({ error: "Nom du repas requis." }, { status: 400 });
  if (!kcal || kcal <= 0 || kcal > 10000) {
    return NextResponse.json({ error: "Kcal invalide." }, { status: 400 });
  }

  const log = createMealLog(userId, name, kcal, date);
  return NextResponse.json({ log });
}

import { NextResponse } from "next/server";
import { getUserIdFromSession } from "@/lib/auth";
import { findUserById } from "@/lib/repo";

export async function GET() {
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ user: null });

  const user = findUserById(userId);
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user: { id: user.id, email: user.email, createdAt: user.created_at } });
}

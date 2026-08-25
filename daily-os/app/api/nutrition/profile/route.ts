import { NextRequest, NextResponse } from "next/server";
import { getProfile, upsertProfile } from "@/lib/repo";
import { requireUserId } from "@/lib/auth";
import { computeTargetKcal, ActivityLevel } from "@/lib/nutrition";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const profile = getProfile(userId);
  return NextResponse.json({
    profile: profile
      ? {
          age: profile.age,
          heightCm: profile.height_cm,
          weightKg: profile.weight_kg,
          sex: profile.sex,
          activityLevel: profile.activity_level,
          targetKcal: profile.target_kcal,
        }
      : null,
  });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const age = Number(body?.age);
  const heightCm = Number(body?.heightCm);
  const weightKg = Number(body?.weightKg);
  const sex = body?.sex === "F" ? "F" : "M";
  const activityLevel = body?.activityLevel as ActivityLevel;

  const validActivity: ActivityLevel[] = [
    "sedentary", "light", "moderate", "active", "very_active",
  ];

  if (!age || age < 10 || age > 100) {
    return NextResponse.json({ error: "Âge invalide." }, { status: 400 });
  }
  if (!heightCm || heightCm < 100 || heightCm > 250) {
    return NextResponse.json({ error: "Taille invalide (cm)." }, { status: 400 });
  }
  if (!weightKg || weightKg < 30 || weightKg > 300) {
    return NextResponse.json({ error: "Poids invalide (kg)." }, { status: 400 });
  }
  if (!validActivity.includes(activityLevel)) {
    return NextResponse.json({ error: "Niveau d'activité invalide." }, { status: 400 });
  }

  const targetKcal = computeTargetKcal({ sex, weightKg, heightCm, age, activityLevel });
  const profile = upsertProfile(userId, { age, heightCm, weightKg, sex, activityLevel, targetKcal });

  return NextResponse.json({
    profile: {
      age: profile.age,
      heightCm: profile.height_cm,
      weightKg: profile.weight_kg,
      sex: profile.sex,
      activityLevel: profile.activity_level,
      targetKcal: profile.target_kcal,
    },
  });
}

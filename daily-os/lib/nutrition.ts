export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sédentaire (peu ou pas de sport)",
  light: "Légère (1-3 séances/semaine)",
  moderate: "Modérée (3-5 séances/semaine)",
  active: "Active (6-7 séances/semaine)",
  very_active: "Très active (sport intense / physique)",
};

/**
 * Formule de Mifflin-St Jeor.
 * Hommes  : 10*poids(kg) + 6.25*taille(cm) - 5*âge + 5
 * Femmes  : 10*poids(kg) + 6.25*taille(cm) - 5*âge - 161
 */
export function computeBMR(params: {
  sex: "M" | "F";
  weightKg: number;
  heightCm: number;
  age: number;
}) {
  const { sex, weightKg, heightCm, age } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "M" ? base + 5 : base - 161;
}

export function computeTargetKcal(params: {
  sex: "M" | "F";
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
}) {
  const bmr = computeBMR(params);
  return Math.round(bmr * ACTIVITY_FACTORS[params.activityLevel]);
}

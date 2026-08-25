import { getDb, newId, nowIso } from "@/lib/db";

// ---------- Users ----------
export type User = { id: string; email: string; password_hash: string; created_at: string };

export function findUserByEmail(email: string): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
}

export function findUserById(id: string): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function createUser(email: string, passwordHash: string): User {
  const id = newId();
  const created_at = nowIso();
  getDb()
    .prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
    .run(id, email, passwordHash, created_at);
  return { id, email, password_hash: passwordHash, created_at };
}

// ---------- Nutrition profile ----------
export type NutritionProfile = {
  id: string; user_id: string; age: number; height_cm: number; weight_kg: number;
  sex: string; activity_level: string; target_kcal: number; updated_at: string;
};

export function getProfile(userId: string): NutritionProfile | undefined {
  return getDb().prepare("SELECT * FROM nutrition_profiles WHERE user_id = ?").get(userId) as
    | NutritionProfile
    | undefined;
}

export function upsertProfile(userId: string, data: {
  age: number; heightCm: number; weightKg: number; sex: string; activityLevel: string; targetKcal: number;
}): NutritionProfile {
  const existing = getProfile(userId);
  const updated_at = nowIso();
  if (existing) {
    getDb()
      .prepare(
        `UPDATE nutrition_profiles SET age=?, height_cm=?, weight_kg=?, sex=?, activity_level=?, target_kcal=?, updated_at=?
         WHERE user_id=?`
      )
      .run(data.age, data.heightCm, data.weightKg, data.sex, data.activityLevel, data.targetKcal, updated_at, userId);
    return { ...existing, ...data, height_cm: data.heightCm, weight_kg: data.weightKg, activity_level: data.activityLevel, target_kcal: data.targetKcal, updated_at };
  }
  const id = newId();
  getDb()
    .prepare(
      `INSERT INTO nutrition_profiles (id, user_id, age, height_cm, weight_kg, sex, activity_level, target_kcal, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, data.age, data.heightCm, data.weightKg, data.sex, data.activityLevel, data.targetKcal, updated_at);
  return {
    id, user_id: userId, age: data.age, height_cm: data.heightCm, weight_kg: data.weightKg,
    sex: data.sex, activity_level: data.activityLevel, target_kcal: data.targetKcal, updated_at,
  };
}

// ---------- Meal logs ----------
export type MealLog = { id: string; user_id: string; date: string; name: string; kcal: number; created_at: string };

export function listMealLogs(userId: string, date: string): MealLog[] {
  return getDb()
    .prepare("SELECT * FROM meal_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC")
    .all(userId, date) as MealLog[];
}

export function createMealLog(userId: string, name: string, kcal: number, date: string): MealLog {
  const id = newId();
  const created_at = nowIso();
  getDb()
    .prepare("INSERT INTO meal_logs (id, user_id, date, name, kcal, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, userId, date, name, kcal, created_at);
  return { id, user_id: userId, date, name, kcal, created_at };
}

export function findMealLog(id: string): MealLog | undefined {
  return getDb().prepare("SELECT * FROM meal_logs WHERE id = ?").get(id) as MealLog | undefined;
}

export function deleteMealLog(id: string) {
  getDb().prepare("DELETE FROM meal_logs WHERE id = ?").run(id);
}

// ---------- Tasks ----------
export type Task = {
  id: string; user_id: string; title: string; status: string; position: number;
  created_at: string; updated_at: string;
};

export function listTasks(userId: string): Task[] {
  return getDb()
    .prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY status ASC, position ASC")
    .all(userId) as Task[];
}

export function countTasksByStatus(userId: string, status: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id = ? AND status = ?")
    .get(userId, status) as { c: number };
  return row.c;
}

export function createTask(userId: string, title: string): Task {
  const id = newId();
  const now = nowIso();
  const position = countTasksByStatus(userId, "TODO");
  getDb()
    .prepare(
      "INSERT INTO tasks (id, user_id, title, status, position, created_at, updated_at) VALUES (?, ?, ?, 'TODO', ?, ?, ?)"
    )
    .run(id, userId, title, position, now, now);
  return { id, user_id: userId, title, status: "TODO", position, created_at: now, updated_at: now };
}

export function findTask(id: string): Task | undefined {
  return getDb().prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
}

export function updateTask(id: string, data: { status?: string; title?: string; position?: number }): Task {
  const current = findTask(id)!;
  const merged = { ...current, ...data, updated_at: nowIso() };
  getDb()
    .prepare("UPDATE tasks SET title=?, status=?, position=?, updated_at=? WHERE id=?")
    .run(merged.title, merged.status, merged.position, merged.updated_at, id);
  return merged;
}

export function deleteTask(id: string) {
  getDb().prepare("DELETE FROM tasks WHERE id = ?").run(id);
}

// ---------- Habits ----------
export type Habit = { id: string; user_id: string; name: string; emoji: string; position: number; created_at: string };
export type HabitLog = { id: string; habit_id: string; date: string; done: number };
export type HabitWithLogs = Habit & { logs: { date: string }[] };

export function listHabits(userId: string): HabitWithLogs[] {
  const habits = getDb()
    .prepare("SELECT * FROM habits WHERE user_id = ? ORDER BY position ASC")
    .all(userId) as Habit[];
  const logsStmt = getDb().prepare("SELECT date FROM habit_logs WHERE habit_id = ?");
  return habits.map((h) => ({ ...h, logs: logsStmt.all(h.id) as { date: string }[] }));
}

export function countHabits(userId: string): number {
  const row = getDb().prepare("SELECT COUNT(*) as c FROM habits WHERE user_id = ?").get(userId) as { c: number };
  return row.c;
}

export function createHabit(userId: string, name: string, emoji: string): HabitWithLogs {
  const id = newId();
  const created_at = nowIso();
  const position = countHabits(userId);
  getDb()
    .prepare("INSERT INTO habits (id, user_id, name, emoji, position, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, userId, name, emoji, position, created_at);
  return { id, user_id: userId, name, emoji, position, created_at, logs: [] };
}

export function findHabit(id: string): Habit | undefined {
  return getDb().prepare("SELECT * FROM habits WHERE id = ?").get(id) as Habit | undefined;
}

export function deleteHabit(id: string) {
  getDb().prepare("DELETE FROM habits WHERE id = ?").run(id);
}

export function toggleHabitLog(habitId: string, date: string): boolean {
  const existing = getDb()
    .prepare("SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?")
    .get(habitId, date) as HabitLog | undefined;

  if (existing) {
    getDb().prepare("DELETE FROM habit_logs WHERE id = ?").run(existing.id);
    return false;
  }
  getDb()
    .prepare("INSERT INTO habit_logs (id, habit_id, date, done) VALUES (?, ?, ?, 1)")
    .run(newId(), habitId, date);
  return true;
}

/**
 * Typed API client for the Express backend.
 */

import type {
  LessonSummary,
  Lesson,
  PracticeSession,
  PracticeSessionInput,
  EarTrainingAttempt,
  EarTrainingAttemptInput,
  EarTrainingPrompt,
  EarTrainingStats,
  LessonProgress,
  TodaySession,
  PathModule,
  PathUnit,
  UnitProgress,
  ReviewCard,
  ReviewRating,
} from "@lag/shared";

const BASE =
  import.meta.env.PUBLIC_API_URL ??
  (typeof window !== "undefined" ? "http://localhost:3001" : "http://localhost:3001");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Bad response from ${path} (status ${res.status})`);
  }
  const envelope = body as { ok: boolean; data?: T; error?: { message: string; code?: string } };
  if (!envelope.ok) {
    throw new Error(envelope.error?.message ?? "Unknown error");
  }
  return envelope.data as T;
}

export const api = {
  health: () => request<{ ok: true; service: string; time: string }>("/health"),

  listLessons: () => request<LessonSummary[]>("/api/lessons"),
  getLesson: (id: string) => request<Lesson>(`/api/lessons/${encodeURIComponent(id)}`),

  listPractice: () => request<PracticeSession[]>("/api/practice"),
  logPractice: (input: PracticeSessionInput) =>
    request<PracticeSession>("/api/practice", { method: "POST", body: JSON.stringify(input) }),

  listAttempts: () => request<EarTrainingAttempt[]>("/api/ear-training/attempts"),
  logAttempt: (input: EarTrainingAttemptInput) =>
    request<EarTrainingAttempt>("/api/ear-training/attempts", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  newPrompt: (type: "scale-degree" | "chord-quality" | "progression" | "adaptive", key?: string) => {
    const q = new URLSearchParams({ type });
    if (key) q.set("key", key);
    return request<EarTrainingPrompt>(`/api/ear-training/prompts/new?${q}`);
  },
  getStats: (type: "scale-degree" | "chord-quality" | "progression") =>
    request<EarTrainingStats>(`/api/ear-training/stats?type=${type}`),

  listLessonProgress: () => request<LessonProgress[]>("/api/progress/lessons"),
  setLessonStatus: (lessonId: string, status: "started" | "complete") =>
    request<LessonProgress>(`/api/progress/lessons/${encodeURIComponent(lessonId)}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  getToday: () => request<TodaySession>("/api/path/today"),
  getPath: () => request<PathModule[]>("/api/path"),
  getUnitProgress: () => request<UnitProgress[]>("/api/path/progress"),
  getUnit: (id: string) => request<PathUnit>(`/api/path/units/${encodeURIComponent(id)}`),
  startUnit: (id: string) =>
    request<UnitProgress>(`/api/path/units/${encodeURIComponent(id)}/start`, { method: "POST" }),
  completeUnit: (id: string, timeSpentSec?: number) =>
    request<UnitProgress>(`/api/path/units/${encodeURIComponent(id)}/complete`, {
      method: "POST",
      body: JSON.stringify({ timeSpentSec }),
    }),
  listReviewCards: () => request<ReviewCard[]>("/api/path/reviews"),
  submitReview: (skillKey: string, rating: ReviewRating) =>
    request<ReviewCard>("/api/path/reviews", {
      method: "POST",
      body: JSON.stringify({ skillKey, rating }),
    }),
  setLastBpm: (bpm: number) =>
    request<{ bpm: number }>("/api/path/settings/bpm", {
      method: "PUT",
      body: JSON.stringify({ bpm }),
    }),
};

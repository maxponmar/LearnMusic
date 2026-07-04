/**
 * Typed API client for the Express backend.
 *
 * Every response is wrapped in the { ok, data } | { ok: false, error } envelope
 * (see @lag/shared). We unwrap it here and throw on errors so calling code can
 * use plain try/catch. Response shapes are validated at the type level by the
 * zod-derived types in @lag/shared — runtime re-validation is deferred until
 * we see real drift.
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
} from "@lag/shared";

const BASE =
  (import.meta as any).env?.PUBLIC_API_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

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

  newPrompt: (type: "scale-degree" | "chord-quality" | "progression") =>
    request<EarTrainingPrompt>(`/api/ear-training/prompts/new?type=${type}`),
  getStats: (type: "scale-degree" | "chord-quality" | "progression") =>
    request<EarTrainingStats>(`/api/ear-training/stats?type=${type}`),

  listLessonProgress: () => request<LessonProgress[]>("/api/progress/lessons"),
  setLessonStatus: (lessonId: string, status: "started" | "complete") =>
    request<LessonProgress>(`/api/progress/lessons/${encodeURIComponent(lessonId)}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

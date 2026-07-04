/**
 * AppIsland — the single React SPA mounted via `client:only="react"` on the
 * /app/* Astro routes. Owns the entire interactive learning experience:
 * client-side routing, shared client state, the fretboard, ear trainer, and
 * practice journal.
 *
 * Why client:only? The app is ~90% interactive (live state shared between
 * fretboard, audio engine, and journal), so it's effectively a React SPA.
 * Astro's islands shine for content pages; here we use one big island and let
 * React Router handle the in-app navigation. SSR would buy us nothing —
 * there's no per-route content to index.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../app/routes/AppLayout";
import { AppHome } from "../app/routes/AppHome";
import { LessonsList } from "../app/routes/LessonsList";
import { LessonReader } from "../app/routes/LessonReader";
import { Journal } from "../app/routes/Journal";
import { FretboardLab } from "../app/routes/FretboardLab";
import { EarTrainer } from "../app/routes/EarTrainer";

export default function AppIsland() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index path="/app" element={<AppHome />} />
          <Route path="/app/lessons" element={<LessonsList />} />
          <Route path="/app/lessons/:id" element={<LessonReader />} />
          <Route path="/app/ear-training" element={<EarTrainer />} />
          <Route path="/app/journal" element={<Journal />} />
          <Route path="/app/fretboard" element={<FretboardLab />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

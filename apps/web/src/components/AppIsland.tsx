/**
 * AppIsland — React SPA for the guided learning experience.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../app/routes/AppLayout";
import { Today } from "../app/routes/Today";
import { Path } from "../app/routes/Path";
import { UnitPractice } from "../app/routes/UnitPractice";
import { Library } from "../app/routes/Library";
import { Tools } from "../app/routes/Tools";
import { Settings } from "../app/routes/Settings";
import { LessonsList } from "../app/routes/LessonsList";
import { LessonReader } from "../app/routes/LessonReader";
import { SongsList } from "../app/routes/SongsList";
import { SongChart } from "../app/routes/SongChart";
import { Journal } from "../app/routes/Journal";
import { FretboardLab } from "../app/routes/FretboardLab";
import { EarTrainer } from "../app/routes/EarTrainer";
import { MetronomePage } from "../app/routes/Metronome";

export default function AppIsland() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index path="/app" element={<Navigate to="/app/today" replace />} />
          <Route path="/app/today" element={<Today />} />
          <Route path="/app/path" element={<Path />} />
          <Route path="/app/units/:id" element={<UnitPractice />} />
          <Route path="/app/library" element={<Library />} />
          <Route path="/app/tools" element={<Tools />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/lessons" element={<LessonsList />} />
          <Route path="/app/lessons/:id" element={<LessonReader />} />
          <Route path="/app/songs" element={<SongsList />} />
          <Route path="/app/songs/:slug" element={<SongChart />} />
          <Route path="/app/ear-training" element={<EarTrainer />} />
          <Route path="/app/journal" element={<Journal />} />
          <Route path="/app/fretboard" element={<FretboardLab />} />
          <Route path="/app/metronome" element={<MetronomePage />} />
          <Route path="*" element={<Navigate to="/app/today" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

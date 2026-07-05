/**
 * Song Chart Library — seed data.
 *
 * Charts are stored key-agnostic, as Nashville Number System (NNS) tokens
 * per bar (`"1"`, `"4"`, `"6m"`, …). `@lag/theory`'s `chordForToken` renders
 * any chart into any concrete key at read time — the same chart works
 * whether the singer wants it in G or in Bb.
 *
 * Chord progressions only — never lyrics. These are quick loop-level charts
 * captured from memory/ear, not transcriptions of a definitive studio chart.
 * Every one of them MUST be re-verified by ear (Module 3 skill) before being
 * used to lead or teach from — see each chart's `notes` field.
 */

import type { SongChartData, SongSection } from "@lag/shared";

export type { SongChartData, SongSection };

const SEED_NOTE =
  "Seed chart — a loop-level starting point, not a verified transcription. " +
  "Verify every section by ear (Module 3 skill) before trusting it to lead or teach from.";

function bars(tokens: string): string[] {
  return tokens.trim().split(/\s+/);
}

export const SONG_CHARTS: SongChartData[] = [
  {
    slug: "cornerstone",
    title: "Cornerstone",
    artist: "Hillsong Worship",
    language: "en",
    defaultKey: "C",
    timeSignature: "4/4",
    bpm: 72,
    repertoire: "worship",
    recommendedAfterOrder: 20,
    sections: [
      { name: "Verse", bars: bars("1 4 1 5") },
      { name: "Chorus", bars: bars("1 4 6m 5") },
    ],
    notes: SEED_NOTE,
  },
  {
    slug: "what-a-beautiful-name",
    title: "What A Beautiful Name",
    artist: "Hillsong Worship",
    language: "en",
    defaultKey: "D",
    timeSignature: "4/4",
    bpm: 68,
    repertoire: "worship",
    recommendedAfterOrder: 20,
    sections: [
      { name: "Verse", bars: bars("1 5 6m 4") },
      { name: "Chorus", bars: bars("1 5 6m 4") },
      { name: "Bridge", bars: bars("6m 4 1 5") },
    ],
    notes: SEED_NOTE,
  },
  {
    slug: "oceans",
    title: "Oceans (Where Feet May Fail)",
    artist: "Hillsong United",
    language: "en",
    defaultKey: "D",
    timeSignature: "4/4",
    bpm: 74,
    repertoire: "worship",
    recommendedAfterOrder: 20,
    sections: [
      { name: "Verse", bars: bars("6m 5 1 4") },
      { name: "Chorus", bars: bars("1 5 6m 4") },
    ],
    notes: SEED_NOTE,
  },
  {
    slug: "o-come-to-the-altar",
    title: "O Come to the Altar",
    artist: "Elevation Worship",
    language: "en",
    defaultKey: "G",
    timeSignature: "4/4",
    bpm: 72,
    repertoire: "worship",
    recommendedAfterOrder: 20,
    sections: [
      { name: "Verse", bars: bars("1 1 4 4") },
      { name: "Chorus", bars: bars("1 5 6m 4") },
    ],
    notes: SEED_NOTE,
  },
  {
    slug: "graves-into-gardens",
    title: "Graves Into Gardens",
    artist: "Elevation Worship",
    language: "en",
    defaultKey: "G",
    timeSignature: "4/4",
    bpm: 76,
    repertoire: "worship",
    recommendedAfterOrder: 20,
    sections: [
      { name: "Verse", bars: bars("1 4 6m 5") },
      { name: "Chorus", bars: bars("1 4 6m 5") },
    ],
    notes: SEED_NOTE,
  },
  {
    slug: "renuevame",
    title: "Renuévame",
    artist: "Marcos Witt",
    language: "es",
    defaultKey: "D",
    timeSignature: "4/4",
    bpm: 80,
    repertoire: "worship",
    recommendedAfterOrder: 20,
    sections: [
      { name: "Verse", bars: bars("1 4 5 1") },
      { name: "Chorus", bars: bars("1 4 5 1") },
    ],
    notes: SEED_NOTE,
  },
  {
    slug: "gracia-sublime-es",
    title: "Gracia Sublime Es",
    artist: "Un Corazón",
    language: "es",
    defaultKey: "G",
    timeSignature: "4/4",
    bpm: 78,
    repertoire: "worship",
    recommendedAfterOrder: 20,
    sections: [
      { name: "Verse", bars: bars("1 5 6m 4") },
      { name: "Chorus", bars: bars("6m 4 1 5") },
    ],
    notes: SEED_NOTE,
  },
  {
    slug: "tu-fidelidad",
    title: "Tu Fidelidad",
    artist: "Marcos Witt",
    language: "es",
    defaultKey: "C",
    timeSignature: "4/4",
    bpm: 72,
    repertoire: "worship",
    recommendedAfterOrder: 20,
    sections: [
      { name: "Verse", bars: bars("1 4 5 1") },
      { name: "Chorus", bars: bars("4 5 1 6m") },
    ],
    notes: SEED_NOTE,
  },
];

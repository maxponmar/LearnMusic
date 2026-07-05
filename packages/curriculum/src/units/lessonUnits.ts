import type { CurriculumUnit } from "../types.js";

/**
 * Micro-units derived from the 13 deep-dive lessons (2 per lesson).
 * Each links to the full lesson HTML for optional reading.
 */
export const LESSON_UNITS: CurriculumUnit[] = [
  // Module 2 — from 0001, 0002, 0003
  {
    id: "notes-01-low-e-a",
    title: "Name notes on low E and A",
    moduleId: "notes-major-scale",
    moduleName: "2 · Notes & major scale",
    order: 11,
    type: "learn",
    skills: ["note-names-low"],
    html: `<p>Notes repeat every 12 frets. On the low E string: open E, fret 1 F, 2 F#, 3 G…</p>
<div data-fretboard data-tonic="G" data-mode="root-only" data-frets="5" data-start-fret="0"></div>
<div class="listen-play"><ol>
<li>Click each dot — hear the note, find it on your low E string.</li>
<li>Say the name aloud before you play.</li>
</ol></div>`,
    practice: [{ tool: "fretboard", label: "Root-only G — low strings", href: "/app/fretboard?key=G&mode=root-only", minutes: 8 }],
    unlockAfter: ["instrument-05-play-with-click"],
    passCriteria: { type: "manual", minSeconds: 300 },
    deepDiveLessonId: "0001-name-any-note",
    estimatedMinutes: 10,
  },
  {
    id: "notes-02-full-neck",
    title: "Landmarks across the neck",
    moduleId: "notes-major-scale",
    moduleName: "2 · Notes & major scale",
    order: 12,
    type: "drill",
    skills: ["note-names-low"],
    html: `<p>Find every G on the fretboard — they're your landmarks in the key of G.</p>
<div data-fretboard data-tonic="G" data-mode="root-only" data-frets="12"></div>
<div class="listen-play"><ol>
<li>Click each G — play it on your guitar.</li>
<li>With metronome at 60 BPM, play one G per bar, different positions each bar.</li>
</ol></div>`,
    practice: [
      { tool: "fretboard", label: "All G roots", href: "/app/fretboard?key=G&mode=root-only", minutes: 5 },
      { tool: "metronome", label: "One G per bar", bpm: 60, minutes: 3 },
    ],
    unlockAfter: ["notes-01-low-e-a"],
    passCriteria: { type: "manual", minSeconds: 300 },
    deepDiveLessonId: "0001-name-any-note",
    estimatedMinutes: 10,
  },
  {
    id: "intervals-01-hear-thirds",
    title: "Hear major and minor thirds",
    moduleId: "notes-major-scale",
    moduleName: "2 · Notes & major scale",
    order: 13,
    type: "learn",
    skills: ["interval-m3", "interval-M3"],
    html: `<p>A <strong>third</strong> is the distance from the root to the 3rd scale degree. Major thirds sound bright; minor thirds sound darker.</p>
<div data-fretboard data-tonic="G" data-mode="scale" data-frets="5"></div>
<div class="listen-play"><ol>
<li>Click degree 1 (G) then degree 3 (B) — hear the major third.</li>
<li>In A minor context, compare the minor third.</li>
</ol></div>`,
    practice: [
      { tool: "fretboard", label: "G major scale — degrees 1 and 3", href: "/app/fretboard?key=G&mode=scale", minutes: 5 },
      { tool: "ear", label: "Scale-degree drill", href: "/app/ear-training?mode=scale-degree", minutes: 5 },
    ],
    unlockAfter: ["notes-02-full-neck"],
    passCriteria: { type: "manual", minSeconds: 300 },
    deepDiveLessonId: "0002-intervals",
    estimatedMinutes: 10,
  },
  {
    id: "scale-01-walk-g-major",
    title: "Walk the G major scale",
    moduleId: "notes-major-scale",
    moduleName: "2 · Notes & major scale",
    order: 14,
    type: "drill",
    skills: ["major-scale"],
    html: `<p>G major: G A B C D E F# G — seven notes, whole-step/half-step pattern.</p>
<div data-fretboard data-tonic="G" data-mode="scale" data-frets="12"></div>
<div class="listen-play"><ol>
<li>Click each scale note low to high.</li>
<li>Play the scale on one string with metronome — one note per click.</li>
<li>Sing do-re-mi along as you play.</li>
</ol></div>`,
    practice: [
      { tool: "fretboard", label: "Play G major scale", href: "/app/fretboard?key=G&mode=scale", minutes: 5 },
      { tool: "metronome", label: "One scale degree per click", bpm: 60, minutes: 4 },
    ],
    unlockAfter: ["intervals-01-hear-thirds"],
    passCriteria: { type: "manual", minSeconds: 360 },
    deepDiveLessonId: "0003-major-scale",
    estimatedMinutes: 12,
  },
  // Module 3 — from 0004
  {
    id: "degrees-01-hear-1-3-5",
    title: "Hear degrees 1, 3, and 5",
    moduleId: "scale-degrees",
    moduleName: "3 · Scale degrees",
    order: 15,
    type: "learn",
    skills: ["scale-degree-1", "scale-degree-3", "scale-degree-5"],
    html: `<p>Every note in a key has a <strong>job</strong>. Degree 1 = home. Degree 5 = tension toward home. Degree 3 = major or minor color.</p>
<div data-fretboard data-tonic="G" data-mode="scale" data-frets="5"></div>
<div class="listen-play"><ol>
<li>Ear trainer: identify scale degrees after the cadence.</li>
<li>Find each degree you hear on the fretboard.</li>
</ol></div>`,
    practice: [{ tool: "ear", label: "Scale-degree ear trainer", href: "/app/ear-training?mode=scale-degree", minutes: 10 }],
    unlockAfter: ["scale-01-walk-g-major"],
    passCriteria: { type: "ear-reps", minReps: 10, minAccuracy: 0.6 },
    deepDiveLessonId: "0004-scale-degrees",
    estimatedMinutes: 12,
  },
  {
    id: "degrees-02-find-on-neck",
    title: "Find degrees on the neck",
    moduleId: "scale-degrees",
    moduleName: "3 · Scale degrees",
    order: 16,
    type: "checkpoint",
    skills: ["scale-degree-1", "scale-degree-3", "scale-degree-5"],
    html: `<p>Loop: app plays a degree → you find it on the neck → say the number aloud.</p>
<div class="listen-play"><ol>
<li>10 reps in the ear trainer.</li>
<li>After each correct answer, locate that degree on the G major fretboard.</li>
</ol></div>`,
    practice: [
      { tool: "ear", label: "10 scale-degree reps", href: "/app/ear-training?mode=scale-degree", minutes: 8 },
      { tool: "fretboard", label: "Match degrees on neck", href: "/app/fretboard?key=G&mode=scale", minutes: 5 },
    ],
    unlockAfter: ["degrees-01-hear-1-3-5"],
    passCriteria: { type: "ear-reps", minReps: 10, minAccuracy: 0.7 },
    deepDiveLessonId: "0004-scale-degrees",
    estimatedMinutes: 15,
  },
  // Module 4 — from 0005, 0006
  {
    id: "triads-01-diatonic",
    title: "Seven chords from one scale",
    moduleId: "chords-keys",
    moduleName: "4 · Chords & keys",
    order: 17,
    type: "learn",
    skills: ["diatonic-triads"],
    html: `<p>Stack thirds on each scale degree → seven triads. In G major: G, Am, Bm, C, D, Em, F#dim.</p>
<div data-fretboard data-tonic="G" data-mode="scale" data-frets="5"></div>
<div class="listen-play"><ol>
<li>Click each scale degree — hear the root.</li>
<li>Ear trainer: major vs minor chord quality.</li>
</ol></div>`,
    practice: [{ tool: "ear", label: "Chord quality drill", href: "/app/ear-training?mode=chord-quality", minutes: 10 }],
    unlockAfter: ["degrees-02-find-on-neck"],
    passCriteria: { type: "ear-reps", minReps: 8, minAccuracy: 0.6 },
    deepDiveLessonId: "0005-diatonic-triads",
    estimatedMinutes: 12,
  },
  {
    id: "nns-01-numbers-not-letters",
    title: "Numbers instead of chord names",
    moduleId: "chords-keys",
    moduleName: "4 · Chords & keys",
    order: 18,
    type: "learn",
    skills: ["keys-gdca"],
    html: `<p>The Nashville Number System: <strong>1 4 5 6m</strong> works in any key. G-C-D-Em in G becomes D-G-A-Bm in D.</p>
<div data-fretboard data-tonic="G" data-mode="root-only" data-frets="5"></div>
<div class="listen-play"><ol>
<li>Say the numbers while playing I-IV-V in G (G, C, D).</li>
<li>Metronome: one chord per bar.</li>
</ol></div>`,
    practice: [
      { tool: "metronome", label: "I-IV-V in G — one chord per bar", bpm: 70, minutes: 5 },
      { tool: "fretboard", label: "G roots", href: "/app/fretboard?key=G&mode=root-only", minutes: 3 },
    ],
    unlockAfter: ["triads-01-diatonic"],
    passCriteria: { type: "manual", minSeconds: 300 },
    deepDiveLessonId: "0006-nashville-number-system",
    estimatedMinutes: 10,
  },
  // Module 5 — from 0007, progressions
  {
    id: "prog-01-hear-1564",
    title: "Hear the 1-5-6-4 pattern",
    moduleId: "play-with-purpose",
    moduleName: "5 · Play with purpose",
    order: 19,
    type: "learn",
    skills: ["progression-ear"],
    html: `<p>The most common pop progression: <strong>1 → 5 → 6 → 4</strong>. In G: G → D → Em → C.</p>
<div class="listen-play"><ol>
<li>Ear trainer: progression recognition.</li>
<li>When you hear it, name the numbers before the chord names.</li>
</ol></div>`,
    practice: [{ tool: "ear", label: "Progression ear trainer", href: "/app/ear-training?mode=progression", minutes: 10 }],
    unlockAfter: ["nns-01-numbers-not-letters"],
    passCriteria: { type: "ear-reps", minReps: 8, minAccuracy: 0.5 },
    deepDiveLessonId: "0007-worship-progressions",
    estimatedMinutes: 12,
  },
  {
    id: "song-01-play-with-click",
    title: "Play a song section in time",
    moduleId: "play-with-purpose",
    moduleName: "5 · Play with purpose",
    order: 20,
    type: "apply",
    skills: ["song-apply", "progression-ear"],
    html: `<p>Pick a song from the library. Use <strong>Practice mode</strong>: metronome + guitar chords together.</p>
<div class="listen-play"><ol>
<li>Open a song chart — start practice at the suggested BPM.</li>
<li>Loop one section until you can play it without stopping.</li>
<li>Log your session in the journal.</li>
</ol></div>`,
    practice: [{ tool: "songs", label: "Song practice with metronome", href: "/app/songs", minutes: 15 }],
    unlockAfter: ["prog-01-hear-1564"],
    passCriteria: { type: "manual", minSeconds: 600 },
    deepDiveLessonId: "0007-worship-progressions",
    estimatedMinutes: 15,
  },
  // Module 6 — from 0008-0013 (improv track)
  {
    id: "pent-01-five-notes",
    title: "Major pentatonic — five safe notes",
    moduleId: "improv-basics",
    moduleName: "6 · Improv basics",
    order: 21,
    type: "learn",
    skills: ["pentatonic-major"],
    html: `<p>Pentatonic = 5 notes that always sound good over the key. G major pentatonic: G A B D E.</p>
<div data-fretboard data-tonic="G" data-mode="scale" data-quality="major" data-pentatonic="true" data-frets="12"></div>
<div class="listen-play"><ol>
<li>Click each dot — play it on your guitar.</li>
<li>Metronome 60 BPM: one note per click, any order.</li>
</ol></div>`,
    practice: [
      { tool: "fretboard", label: "G major pentatonic", href: "/app/fretboard?key=G&pentatonic=true", minutes: 6 },
      { tool: "metronome", label: "Improv one note per click", bpm: 60, minutes: 4 },
    ],
    unlockAfter: ["song-01-play-with-click"],
    passCriteria: { type: "manual", minSeconds: 360 },
    deepDiveLessonId: "0008-pentatonic-scale",
    estimatedMinutes: 12,
  },
  {
    id: "caged-01-position-1",
    title: "CAGED position 1 (open G)",
    moduleId: "improv-basics",
    moduleName: "6 · Improv basics",
    order: 22,
    type: "drill",
    skills: ["pentatonic-major"],
    html: `<p>The open-position G shape is CAGED position 1. It's your home base for fills in G.</p>
<div data-fretboard data-tonic="G" data-mode="scale" data-pentatonic="true" data-frets="5" data-start-fret="0"></div>`,
    practice: [{ tool: "fretboard", label: "Open-position pentatonic", href: "/app/fretboard?key=G&pentatonic=true", minutes: 8 }],
    unlockAfter: ["pent-01-five-notes"],
    passCriteria: { type: "manual", minSeconds: 300 },
    deepDiveLessonId: "0009-caged",
    estimatedMinutes: 10,
  },
  {
    id: "motifs-01-three-notes",
    title: "Three-note motifs",
    moduleId: "improv-basics",
    moduleName: "6 · Improv basics",
    order: 23,
    type: "drill",
    skills: ["pentatonic-major"],
    html: `<p>A <strong>motif</strong> is a short repeatable idea — three notes, one rhythm. Repeat, then vary one note.</p>
<div class="listen-play"><ol>
<li>Pick 3 pentatonic notes in G.</li>
<li>Metronome 60 BPM: play your motif on beats 1-2-3, rest on 4.</li>
<li>Repeat 8 bars, then change one note.</li>
</ol></div>`,
    practice: [{ tool: "metronome", label: "Motif on beats 1-2-3", bpm: 60, minutes: 6 }],
    unlockAfter: ["caged-01-position-1"],
    passCriteria: { type: "manual", minSeconds: 300 },
    deepDiveLessonId: "0011-motifs",
    estimatedMinutes: 10,
  },
  {
    id: "space-01-leave-gaps",
    title: "Space and dynamics",
    moduleId: "improv-basics",
    moduleName: "6 · Improv basics",
    order: 24,
    type: "learn",
    skills: ["pentatonic-major"],
    html: `<p>The best fills leave room. Play <strong>less</strong> — one soft note, then silence.</p>
<div class="listen-play"><ol>
<li>Metronome 60 BPM: play one quiet note on beat 1 only.</li>
<li>Rest beats 2-3-4. Do 8 bars.</li>
</ol></div>`,
    practice: [{ tool: "metronome", label: "One note per bar — rest the other 3", bpm: 60, minutes: 5 }],
    unlockAfter: ["motifs-01-three-notes"],
    passCriteria: { type: "manual", minSeconds: 240 },
    deepDiveLessonId: "0012-space-and-dynamics",
    estimatedMinutes: 8,
  },
  {
    id: "capo-01-transpose",
    title: "Capo as transposition",
    moduleId: "improv-basics",
    moduleName: "6 · Improv basics",
    order: 25,
    type: "apply",
    skills: ["keys-gdca", "song-apply"],
    html: `<p>Capo lets you play familiar shapes in a new key. Capo 2 + G shapes = A key.</p>
<div data-fretboard data-tonic="G" data-mode="root-only" data-frets="5"></div>
<div class="listen-play"><ol>
<li>Review a song chart with capo suggestion.</li>
<li>Practice with metronome at song BPM.</li>
</ol></div>`,
    practice: [{ tool: "songs", label: "Song with capo note", href: "/app/songs", minutes: 12 }],
    unlockAfter: ["space-01-leave-gaps"],
    passCriteria: { type: "manual", minSeconds: 360 },
    deepDiveLessonId: "0013-capo-strategy",
    estimatedMinutes: 12,
  },
];

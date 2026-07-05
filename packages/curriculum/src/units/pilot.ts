import type { CurriculumUnit } from "../types.js";

/** Module 0 — rhythm pilot units */
const RHYTHM_UNITS: CurriculumUnit[] = [
  {
    id: "rhythm-01-feel-the-beat",
    title: "Feel the beat",
    moduleId: "time-rhythm",
    moduleName: "0 · Time & rhythm",
    order: 1,
    type: "learn",
    skills: ["rhythm-quarter", "metronome-basic"],
    html: `<p>Music starts with <strong>time</strong>. Before notes or chords, you need a steady pulse — the beat.</p>
<p>In 4/4 time, you count <strong>1 · 2 · 3 · 4</strong> and the pattern repeats. Beat <strong>1</strong> is the downbeat — the strongest.</p>
<div class="listen-play"><p class="listen-play-lead">Do this now:</p><ol>
<li>Set the metronome to <strong>60 BPM</strong> and press Start.</li>
<li>Tap your foot or clap on every click for 8 bars.</li>
<li>Accent beat 1 louder than 2, 3, and 4.</li>
</ol></div>`,
    practice: [{ tool: "metronome", label: "60 BPM — clap on every click", bpm: 60, minutes: 3 }],
    unlockAfter: [],
    passCriteria: { type: "manual", minSeconds: 120 },
    estimatedMinutes: 5,
  },
  {
    id: "rhythm-02-quarter-notes",
    title: "Quarter notes — one per click",
    moduleId: "time-rhythm",
    moduleName: "0 · Time & rhythm",
    order: 2,
    type: "drill",
    skills: ["rhythm-quarter"],
    html: `<p>A <strong>quarter note</strong> lasts one beat. At 60 BPM, you play or strum once per click.</p>
<div class="listen-play"><p class="listen-play-lead">Do this 8 bars:</p><ol>
<li>Start the metronome at 60 BPM.</li>
<li>Strum <em>muted</em> strings (touch lightly, no chord) once per click.</li>
<li>Keep your downstroke on the beat — don't rush ahead of the click.</li>
</ol></div>`,
    practice: [{ tool: "metronome", label: "Muted strum — one per click", bpm: 60, minutes: 4 }],
    unlockAfter: ["rhythm-01-feel-the-beat"],
    passCriteria: { type: "manual", minSeconds: 180 },
    estimatedMinutes: 6,
  },
  {
    id: "rhythm-03-tap-tempo",
    title: "Tap tempo",
    moduleId: "time-rhythm",
    moduleName: "0 · Time & rhythm",
    order: 3,
    type: "drill",
    skills: ["metronome-basic"],
    html: `<p>Songs have a <strong>tempo</strong> (speed). You can find it by tapping the beat you hear.</p>
<div class="listen-play"><ol>
<li>Use <strong>Tap tempo</strong> on the metronome — tap the beat of a song you know.</li>
<li>Play muted quarter notes at that tempo for 4 bars.</li>
<li>Try 72 BPM and 80 BPM — common song speeds.</li>
</ol></div>`,
    practice: [{ tool: "metronome", label: "Tap tempo + play 4 bars", bpm: 72, minutes: 3 }],
    unlockAfter: ["rhythm-02-quarter-notes"],
    passCriteria: { type: "manual", minSeconds: 120 },
    estimatedMinutes: 5,
  },
  {
    id: "rhythm-04-strum-one-chord",
    title: "One chord per bar",
    moduleId: "time-rhythm",
    moduleName: "0 · Time & rhythm",
    order: 4,
    type: "drill",
    skills: ["rhythm-quarter", "metronome-basic"],
    html: `<p>Most beginner songs change chords <strong>once per bar</strong> (four strums per chord in 4/4).</p>
<div class="listen-play"><ol>
<li>Hold an open <strong>G</strong> chord.</li>
<li>Metronome at 60 BPM — strum down once on beat 1, let it ring.</li>
<li>Do 8 bars without stopping or rushing.</li>
</ol></div>`,
    practice: [{ tool: "metronome", label: "G chord — strum beat 1 only", bpm: 60, minutes: 4 }],
    unlockAfter: ["rhythm-03-tap-tempo"],
    passCriteria: { type: "manual", minSeconds: 180 },
    estimatedMinutes: 6,
  },
  {
    id: "rhythm-05-down-up",
    title: "Down-up strumming",
    moduleId: "time-rhythm",
    moduleName: "0 · Time & rhythm",
    order: 5,
    type: "checkpoint",
    skills: ["rhythm-quarter", "metronome-basic"],
    html: `<p>Add an <strong>upstroke</strong> between downbeats: down on 1 and 3, up on 2 and 4 (or down on every beat first).</p>
<div class="listen-play"><ol>
<li>Metronome 70 BPM, open G chord.</li>
<li>Strum <strong>down</strong> on beats 1, 2, 3, 4 for 8 bars.</li>
<li>If steady, try down-up-down-up through the bar.</li>
</ol></div>`,
    practice: [{ tool: "metronome", label: "Down strums with G chord", bpm: 70, minutes: 5 }],
    unlockAfter: ["rhythm-04-strum-one-chord"],
    passCriteria: { type: "manual", minSeconds: 240 },
    estimatedMinutes: 8,
  },
];

/** Module 1 — instrument pilot units */
const INSTRUMENT_UNITS: CurriculumUnit[] = [
  {
    id: "instrument-01-meet-your-guitar",
    title: "Meet your guitar",
    moduleId: "your-instrument",
    moduleName: "1 · Your instrument",
    order: 6,
    type: "learn",
    skills: ["open-strings"],
    html: `<p>Six strings, thin to thick: <strong>E · B · G · D · A · E</strong> (high to low on the diagram).</p>
<p>The <strong>nut</strong> is the white bar at the top; <strong>fret 1</strong> is the first wire. Press behind a fret — not on top of the metal.</p>`,
    practice: [],
    unlockAfter: ["rhythm-05-down-up"],
    passCriteria: { type: "manual", minSeconds: 60 },
    estimatedMinutes: 4,
  },
  {
    id: "instrument-02-open-strings-e",
    title: "Open low E and A",
    moduleId: "your-instrument",
    moduleName: "1 · Your instrument",
    order: 7,
    type: "drill",
    skills: ["open-strings"],
    html: `<p>The two thickest strings are <strong>low E</strong> and <strong>A</strong> — your anchors on the neck.</p>
<div data-open-strings></div>
<div class="listen-play"><ol>
<li>Click each string below to hear it.</li>
<li>Play the open low E on your guitar — match the pitch.</li>
<li>Play open A — match the pitch.</li>
<li>Alternate E and A with the metronome: one pluck per click, 8 bars.</li>
</ol></div>`,
    practice: [
      { tool: "open-strings", label: "Hear and match low E and A", minutes: 3 },
      { tool: "metronome", label: "Alternate E and A — one per click", bpm: 60, minutes: 3 },
    ],
    unlockAfter: ["instrument-01-meet-your-guitar"],
    passCriteria: { type: "manual", minSeconds: 180 },
    estimatedMinutes: 7,
  },
  {
    id: "instrument-03-open-strings-all",
    title: "All six open strings",
    moduleId: "your-instrument",
    moduleName: "1 · Your instrument",
    order: 8,
    type: "drill",
    skills: ["open-strings"],
    html: `<p>From thinnest to thickest: <strong>E B G D A E</strong>. Say the name before you pluck.</p>
<div data-open-strings></div>
<div class="listen-play"><ol>
<li>Click "All open strings" — hear low to high.</li>
<li>Play them on your guitar in order, with the metronome at 60 BPM (one string per beat, then rest).</li>
<li>Repeat 5 times until you don't have to think.</li>
</ol></div>`,
    practice: [
      { tool: "open-strings", label: "All open strings — hear then play", minutes: 4 },
      { tool: "metronome", label: "One string per click", bpm: 60, minutes: 3 },
    ],
    unlockAfter: ["instrument-02-open-strings-e"],
    passCriteria: { type: "manual", minSeconds: 240 },
    estimatedMinutes: 8,
  },
  {
    id: "instrument-04-string-names",
    title: "Name every open string",
    moduleId: "your-instrument",
    moduleName: "1 · Your instrument",
    order: 9,
    type: "checkpoint",
    skills: ["open-strings", "note-names-low"],
    html: `<p>Close your eyes. Someone (or the app) plays a string — you name it. Then play it yourself.</p>
<div data-open-strings></div>
<div class="listen-play"><ol>
<li>Click random strings in the widget — say the name aloud before looking.</li>
<li>Do all six until 6/6 correct twice in a row.</li>
</ol></div>`,
    practice: [{ tool: "open-strings", label: "Random string quiz", minutes: 5 }],
    unlockAfter: ["instrument-03-open-strings-all"],
    passCriteria: { type: "manual", minSeconds: 180 },
    estimatedMinutes: 6,
  },
  {
    id: "instrument-05-play-with-click",
    title: "Play with the click",
    moduleId: "your-instrument",
    moduleName: "1 · Your instrument",
    order: 10,
    type: "apply",
    skills: ["open-strings", "metronome-basic"],
    html: `<p>Combine rhythm + strings: pluck one open string per beat, change string every bar.</p>
<div class="listen-play"><ol>
<li>Metronome 60 BPM, 4/4.</li>
<li>Bar 1: low E · Bar 2: A · Bar 3: D · Bar 4: G · repeat.</li>
<li>8 bars total — no stopping.</li>
</ol></div>`,
    practice: [{ tool: "metronome", label: "One string per bar", bpm: 60, minutes: 5 }],
    unlockAfter: ["instrument-04-string-names"],
    passCriteria: { type: "manual", minSeconds: 240 },
    estimatedMinutes: 8,
  },
];

export { RHYTHM_UNITS, INSTRUMENT_UNITS };

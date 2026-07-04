/**
 * AudioEngine — singleton wrapper around Tone.js for guitar note playback.
 *
 * Lazy-loads Tone.js and acoustic-guitar samples on first use. Browsers
 * require a user gesture before AudioContext can start, so the engine is
 * initialized from a click handler — never at module load.
 *
 * Samples are loaded from the jsDelivr CDN (the `tonejs-instrument-guitar-
 * acoustic-ogg` pack). One sample per octave, pitched in-between by Tone's
 * Sampler. This is the documented sweet spot for realistic tone + low
 * latency + small footprint, per the Tone.js Sampler docs.
 *
 * Usage:
 *   await AudioEngine.init();          // call from a click handler
 *   AudioEngine.playNote(64);          // play MIDI 64 (high E open)
 *   AudioEngine.playNotes([64, 59]);   // play a chord (simultaneous)
 */

import type { FretNote } from "@lag/theory";
import type * as Tone from "tone";

// One sample per octave across the guitar's range. Tone.Sampler pitches the
// samples in between to fill the gaps. URLs use note names with octaves.
const SAMPLE_BASE =
  "https://cdn.jsdelivr.net/npm/tonejs-instrument-guitar-acoustic-ogg@1.0.0/";
// The pack ships samples at C2, C3, C4, C5 (covers guitar range E2–E6).
const SAMPLE_NOTES = ["C2", "C3", "C4", "C5"];

class AudioEngineImpl {
  private tone: typeof Tone | null = null;
  private sampler: Tone.Sampler | null = null;
  private initPromise: Promise<void> | null = null;
  private _ready = false;

  get ready() {
    return this._ready;
  }

  /** Initialize Tone.js + load samples. Must be called from a user gesture. */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    // Dynamic import keeps Tone out of the initial bundle.
    this.tone = await import("tone");
    // Start the audio context (resolves the autoplay-policy requirement).
    await this.tone.start();
    // Lower lookAhead = lower latency at small risk of glitches. For a
    // learning app, immediate feedback matters more than perfect timing.
    this.tone.context.lookAhead = 0.05;

    const samples: Record<string, string> = {};
    for (const note of SAMPLE_NOTES) {
      samples[note] = `${SAMPLE_BASE}${note}.ogg`;
    }
    this.sampler = new this.tone.Sampler({
      urls: samples,
      onload: () => {
        this._ready = true;
      },
    }).toDestination();
  }

  /** Play a single MIDI note. No-op if not initialized. */
  playNote(midi: number, durationSec: number = 1.5): void {
    if (!this.tone || !this.sampler) return;
    const noteName = midiToToneName(midi);
    this.sampler.triggerAttackRelease(noteName, durationSec);
  }

  /** Play several MIDI notes simultaneously (a chord). */
  playNotes(midi: number[], durationSec: number = 1.8): void {
    if (!this.tone || !this.sampler) return;
    const names = midi.map(midiToToneName);
    this.sampler.triggerAttackRelease(names, durationSec);
  }

  /** Play a FretNote (convenience — same as playNote(note.midi)). */
  playFretNote(note: FretNote, durationSec: number = 1.5): void {
    this.playNote(note.midi, durationSec);
  }

  /** Arpeggiate a sequence of MIDI notes with a fixed gap. */
  async arpeggiate(midi: number[], gapSec: number = 0.25, durationSec: number = 0.6): Promise<void> {
    if (!this.tone || !this.sampler) return;
    for (const m of midi) {
      this.playNote(m, durationSec);
      await sleep(gapSec * 1000);
    }
  }

  /**
   * Play a I-IV-V-I cadence in the given key to establish the tonal center.
   * This is the core of functional ear training: the cadence tells the ear
   * "this is home," and the test note is then heard *relative to* that home.
   * Each chord is played as a triad, briefly arpeggiated for clarity.
   *
   * `keyPcs` is the 7 pitch classes of the key (scale degrees 1–7); we build
   * I, IV, V triads from degrees [1,3,5], [4,6,1], [5,7,2].
   */
  async playCadence(
    keyPcs: [number, number, number, number, number, number, number],
    tonicMidi: number,
  ): Promise<void> {
    if (!this.tone || !this.sampler) return;

    // Build triads directly: root = tonicMidi shifted to the degree's pc.
    const midiForPc = (pc: number): number => nearestMidiForPc(pc, tonicMidi);

    const I = [midiForPc(keyPcs[0]!), midiForPc(keyPcs[2]!), midiForPc(keyPcs[4]!)];
    const IV = [midiForPc(keyPcs[3]!), midiForPc(keyPcs[5]!), midiForPc(keyPcs[0]!) + 12];
    const V = [midiForPc(keyPcs[4]!), midiForPc(keyPcs[6]!), midiForPc(keyPcs[1]!) + 12];
    const I_final = [midiForPc(keyPcs[0]!), midiForPc(keyPcs[2]!), midiForPc(keyPcs[4]!)];

    for (const chord of [I, IV, V, I_final]) {
      this.playNotes(chord, 0.6);
      await sleep(700);
    }
  }

  /**
   * Play a chord from a root MIDI + quality, used for chord-quality drills.
   * Returns the MIDI notes actually played (for client display).
   */
  playChord(rootMidi: number, quality: "major" | "minor" | "diminished" | "sus4"): number[] {
    const intervals =
      quality === "major"
        ? [0, 4, 7]
        : quality === "minor"
          ? [0, 3, 7]
          : quality === "diminished"
            ? [0, 3, 6]
            : [0, 5, 7]; // sus4
    const notes = intervals.map((i) => rootMidi + i);
    this.playNotes(notes, 1.6);
    return notes;
  }

  /**
   * Play a chord progression — a sequence of triads, one per beat. Used for
   * the progression-recognition drill. Each chord is played as a block triad
   * for `chordSec`, with `gapSec` between chords.
   */
  async playProgression(chordMidis: number[][], chordSec = 1.1, gapSec = 0.15): Promise<void> {
    if (!this.tone || !this.sampler) return;
    for (const chord of chordMidis) {
      this.playNotes(chord, chordSec);
      await sleep((chordSec + gapSec) * 1000);
    }
  }
}

/** Nearest MIDI for a pitch class relative to an anchor MIDI. */
function nearestMidiForPc(pc: number, anchor: number): number {
  const anchorPc = ((anchor % 12) + 12) % 12;
  let delta = pc - anchorPc;
  if (delta > 6) delta -= 12;
  if (delta < -6) delta += 12;
  return anchor + delta;
}

/** Convert a MIDI number to Tone.js note name (e.g. 64 → "E4"). */
function midiToToneName(midi: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const pc = ((Math.round(midi) % 12) + 12) % 12;
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  return `${names[pc]}${octave}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Singleton — one AudioEngine for the whole app. */
export const AudioEngine = new AudioEngineImpl();

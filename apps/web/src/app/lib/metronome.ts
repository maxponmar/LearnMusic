/**
 * MetronomeEngine — Tone.js click track for rhythm practice.
 *
 * Uses Transport.scheduleRepeat for steady beats. Accent (beat 1) is a
 * lower, louder click; other beats are softer. Must be started from a user
 * gesture (same autoplay policy as AudioEngine).
 */

import type * as Tone from "tone";

export type TimeSignature = 3 | 4;

class MetronomeEngineImpl {
  private tone: typeof Tone | null = null;
  private accentSynth: Tone.MembraneSynth | null = null;
  private clickSynth: Tone.MembraneSynth | null = null;
  private initPromise: Promise<void> | null = null;
  private _running = false;
  private _bpm = 120;
  private _beatsPerMeasure: TimeSignature = 4;
  private beatIndex = 0;
  private onBeatCallback: ((beat: number, isAccent: boolean) => void) | null = null;

  get running() {
    return this._running;
  }

  get bpm() {
    return this._bpm;
  }

  get beatsPerMeasure() {
    return this._beatsPerMeasure;
  }

  /** Wire a callback for visual beat indicators (runs on the main thread). */
  onBeat(cb: (beat: number, isAccent: boolean) => void) {
    this.onBeatCallback = cb;
  }

  /** Initialize Tone + click synths. Call from a user gesture. */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInit().catch((err) => {
      this.initPromise = null;
      throw err;
    });
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    this.tone = await import("tone");
    await this.tone.start();
    this.tone.context.lookAhead = 0.05;

    this.accentSynth = new this.tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 },
    }).toDestination();
    this.accentSynth.volume.value = -4;

    this.clickSynth = new this.tone.MembraneSynth({
      pitchDecay: 0.006,
      octaves: 1,
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
    }).toDestination();
    this.clickSynth.volume.value = -10;
  }

  setBpm(bpm: number): void {
    this._bpm = Math.max(40, Math.min(240, Math.round(bpm)));
    if (this.tone && this._running) {
      this.tone.Transport.bpm.value = this._bpm;
    }
  }

  setBeatsPerMeasure(beats: TimeSignature): void {
    if (this._beatsPerMeasure === beats) return;
    this._beatsPerMeasure = beats;
    if (this._running) {
      void this.restart();
    }
  }

  async start(): Promise<void> {
    await this.init();
    if (!this.tone || this._running) return;

    this.beatIndex = 0;
    this.tone.Transport.bpm.value = this._bpm;
    this.tone.Transport.cancel();
    this.tone.Transport.position = 0;

    this.tone.Transport.scheduleRepeat((time) => {
      const beatInMeasure = this.beatIndex % this._beatsPerMeasure;
      const isAccent = beatInMeasure === 0;

      if (isAccent) {
        this.accentSynth?.triggerAttackRelease("C2", "16n", time);
      } else {
        this.clickSynth?.triggerAttackRelease("G3", "32n", time);
      }

      const beatNumber = beatInMeasure + 1;
      this.tone!.Draw.schedule(() => {
        this.onBeatCallback?.(beatNumber, isAccent);
      }, time);

      this.beatIndex++;
    }, "4n");

    this.tone.Transport.start();
    this._running = true;
  }

  stop(): void {
    if (!this.tone) return;
    this.tone.Transport.stop();
    this.tone.Transport.cancel();
    this._running = false;
    this.beatIndex = 0;
  }

  private async restart(): Promise<void> {
    const wasRunning = this._running;
    this.stop();
    if (wasRunning) await this.start();
  }
}

export const MetronomeEngine = new MetronomeEngineImpl();

/** Compute BPM from recent tap timestamps (ms). Returns null if not enough taps. */
export function bpmFromTaps(taps: number[]): number | null {
  if (taps.length < 2) return null;
  const intervals: number[] = [];
  for (let i = 1; i < taps.length; i++) {
    intervals.push(taps[i]! - taps[i - 1]!);
  }
  const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (avgMs < 100 || avgMs > 2000) return null;
  return Math.round(60000 / avgMs);
}

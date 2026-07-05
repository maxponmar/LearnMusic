/**
 * Instrument definitions — guitar implemented; others stubbed for future UI.
 */

import { OPEN_MIDI, NUM_STRINGS, type StringNumber } from "./fretboard.js";

export type InstrumentId = "acoustic-guitar" | "ukulele" | "banjo" | "piano";

export interface StringSpec {
  number: number;
  openMidi: number;
  label: string;
}

export interface InstrumentSpec {
  id: InstrumentId;
  displayName: string;
  strings: StringSpec[];
  /** Whether interactive fretboard is available in the app. */
  fretboardEnabled: boolean;
}

const GUITAR_STRINGS: StringSpec[] = [
  { number: 1, openMidi: OPEN_MIDI[1]!, label: "E" },
  { number: 2, openMidi: OPEN_MIDI[2]!, label: "B" },
  { number: 3, openMidi: OPEN_MIDI[3]!, label: "G" },
  { number: 4, openMidi: OPEN_MIDI[4]!, label: "D" },
  { number: 5, openMidi: OPEN_MIDI[5]!, label: "A" },
  { number: 6, openMidi: OPEN_MIDI[6]!, label: "E" },
];

/** Standard ukulele re-entrant tuning G4 C4 E4 A4 (high G). */
const UKULELE_STRINGS: StringSpec[] = [
  { number: 1, openMidi: 67, label: "A" },
  { number: 2, openMidi: 64, label: "E" },
  { number: 3, openMidi: 60, label: "C" },
  { number: 4, openMidi: 67, label: "G" },
];

/** Open G banjo tuning — stub for future. */
const BANJO_STRINGS: StringSpec[] = [
  { number: 1, openMidi: 62, label: "D" },
  { number: 2, openMidi: 59, label: "B" },
  { number: 3, openMidi: 55, label: "G" },
  { number: 4, openMidi: 50, label: "D" },
  { number: 5, openMidi: 67, label: "G" },
];

export const INSTRUMENTS: Record<InstrumentId, InstrumentSpec> = {
  "acoustic-guitar": {
    id: "acoustic-guitar",
    displayName: "Acoustic guitar",
    strings: GUITAR_STRINGS,
    fretboardEnabled: true,
  },
  ukulele: {
    id: "ukulele",
    displayName: "Ukulele",
    strings: UKULELE_STRINGS,
    fretboardEnabled: false,
  },
  banjo: {
    id: "banjo",
    displayName: "Banjo",
    strings: BANJO_STRINGS,
    fretboardEnabled: false,
  },
  piano: {
    id: "piano",
    displayName: "Piano",
    strings: [],
    fretboardEnabled: false,
  },
};

export function getInstrument(id: InstrumentId): InstrumentSpec {
  return INSTRUMENTS[id] ?? INSTRUMENTS["acoustic-guitar"];
}

export function stringCount(id: InstrumentId): number {
  return getInstrument(id).strings.length || NUM_STRINGS;
}

/** Open MIDI for a string on an instrument (guitar uses fretboard OPEN_MIDI). */
export function openMidiFor(instrument: InstrumentId, stringNum: StringNumber): number {
  if (instrument === "acoustic-guitar") return OPEN_MIDI[stringNum]!;
  const spec = getInstrument(instrument).strings.find((s) => s.number === stringNum);
  return spec?.openMidi ?? OPEN_MIDI[stringNum]!;
}

/** Piano keyboard range stub — C3 to C6 for future renderer. */
export function pianoRange(): { lowMidi: number; highMidi: number } {
  return { lowMidi: 48, highMidi: 84 };
}

const NOTE_OFFSETS: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

/**
 * 将乐理音高（如 "C4"、"D#3"、"Bb2"）转换为 MIDI 音高编号（0–127）。
 * 约定：C4 = 60，对应 MIDI 标准和 Tone.js 的默认定义。
 */
export function noteNameToMidi(note: string): number | null {
  const trimmed = note.trim();
  const match = trimmed.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) return null;

  const [, letterRaw, accidental, octaveRaw] = match;
  const letter = letterRaw.toUpperCase();
  const key = (letter + (accidental || '')) as keyof typeof NOTE_OFFSETS;
  const semitone = NOTE_OFFSETS[key];
  if (semitone === undefined) return null;

  const octave = Number(octaveRaw);
  if (!Number.isInteger(octave)) return null;

  const midi = (octave + 1) * 12 + semitone;
  if (midi < 0 || midi > 127) return null;

  return midi;
}

/**
 * 将 MIDI 音高编号（0–127）转换回乐理音高字符串（如 "C4"）。
 * 使用升号表示半音（如 "F#3"），同样遵循 C4 = 60。
 */
export function midiToNoteName(midi: number): string | null {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) return null;

  const SEMITONE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const semitone = midi % 12;
  const octave = Math.floor(midi / 12) - 1;

  return `${SEMITONE_NAMES[semitone]}${octave}`;
}


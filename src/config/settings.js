// Configuration Settings for AirPiano Web

export const PINCH_THRESHOLD = 0.07;

// Bank mappings: 1 to 5 fingers extended on Chord Selector (Left hand)
// Each bank has a dictionary mapping the playing finger to a list of MIDI note numbers.
// Duplicate notes in the requirements are retained as multiple note-on events if specified.
export const NOTE_BANKS = {
    1: {
        "Index": [50, 53, 58, 62],  // D3, F3, Bb3, D4
        "Middle": [53],             // F3
        "Ring": [58],               // Bb3
        "Little": [62],             // D4
    },
    2: {
        "Index": [67, 79],          // G4, G5
        "Middle": [65, 77],         // F4, F5
        "Ring": [50, 53, 58],       // D3, F3, Bb3
        "Little": [55, 60],         // G3, C4
    },
    3: {
        "Index": [55, 58, 62],      // G3, Bb3, D4
        "Middle": [69, 81],         // A4, A5
        "Ring": [55, 60, 63],       // G3, C4, Eb4
        "Little": [65],             // F4
    },
    4: {
        "Index": [72],              // C5
        "Middle": [63],             // Eb4
        "Ring": [62, 62],           // D4, D4 (Duplicate retained as requested)
        "Little": [60],             // C4
    },
    5: {
        "Index": [74, 86],          // D5, D6
        "Middle": [72, 84],         // C5, C6
        "Ring": [63, 63],           // Eb4, Eb4 (Duplicate retained as requested)
        "Little": [65, 65],         // F4, F4 (Duplicate retained as requested)
    }
};

// Note number to name for UI display
export function noteName(noteNum) {
    const notes = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
    const octave = Math.floor(noteNum / 12) - 1;
    const note = notes[noteNum % 12];
    return `${note}${octave}`;
}

// Configuration Settings for AirPiano Web

export const PINCH_THRESHOLD = 0.07;

export const NOTE_BANKS = {
    1: {
        "Index": ["D3", "F3", "Bb3", "D4"],
        "Middle": ["F3"],
        "Ring": ["Bb3"],
        "Little": ["D4"],
    },
    2: {
        "Index": ["G4", "G5"],
        "Middle": ["F4", "F5"],
        "Ring": ["D3", "F3", "Bb3"],
        "Little": ["G3", "C4"],
    },
    3: {
        "Index": ["G3", "Bb3", "D4"],
        "Middle": ["A4", "A5"],
        "Ring": ["G3", "C4", "Eb4"],
        "Little": ["F4"],
    },
    4: {
        "Index": ["C5"],
        "Middle": ["Eb4"],
        "Ring": ["D4"], // Removed duplicate for standard Tone.js triggers
        "Little": ["C4"],
    },
    5: {
        "Index": ["D5", "D6"],
        "Middle": ["C5", "C6"],
        "Ring": ["Eb4"],
        "Little": ["F4"],
    }
};

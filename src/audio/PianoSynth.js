class PianoSynth {
    constructor() {
        this.midiOutput = null;
        this.activeNotes = new Set();
    }

    async init() {
        if (navigator.requestMIDIAccess) {
            try {
                const midiAccess = await navigator.requestMIDIAccess();
                // Grab the first available output port (usually Microsoft GS Wavetable Synth on Windows)
                for (let output of midiAccess.outputs.values()) {
                    this.midiOutput = output;
                    console.log("Connected to MIDI Output:", output.name);
                    break;
                }
                if (!this.midiOutput) {
                    console.warn("No MIDI outputs found. Please ensure your system has a MIDI synthesizer available.");
                }
            } catch (err) {
                console.error("MIDI Access Failed:", err);
            }
        } else {
            console.warn("Web MIDI API not supported in this browser.");
        }
    }

    playNotes(notes) {
        if (!notes || !this.midiOutput) return;
        notes.forEach(note => {
            // Note On message: [144, note_number, velocity]
            this.midiOutput.send([144, note, 100]);
            this.activeNotes.add(note);
        });
    }

    releaseNotes(notes) {
        if (!notes || !this.midiOutput) return;
        notes.forEach(note => {
            // Note Off message: [128, note_number, velocity]
            this.midiOutput.send([128, note, 0]);
            this.activeNotes.delete(note);
        });
    }

    releaseAll() {
        if (this.midiOutput && this.activeNotes.size > 0) {
            this.activeNotes.forEach(note => {
                this.midiOutput.send([128, note, 0]);
            });
            this.activeNotes.clear();
        }
    }
}

export default PianoSynth;

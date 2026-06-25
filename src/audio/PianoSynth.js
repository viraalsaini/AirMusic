import * as Tone from 'tone';

class PianoSynth {
    constructor() {
        // Create a nice polyphonic synth with a soft envelope to mimic a piano
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.02,
                decay: 0.5,
                sustain: 0.3,
                release: 1.5,
            }
        }).toDestination();
        
        // Add a bit of reverb for that grand piano feel
        this.reverb = new Tone.Reverb({
            decay: 2.5,
            preDelay: 0.01
        }).toDestination();
        
        this.synth.connect(this.reverb);
        this.activeNotes = new Set();
    }

    async init() {
        await Tone.start();
        console.log("Audio Context Started");
    }

    playNotes(notes) {
        if (!notes) return;
        this.synth.triggerAttack(notes);
        notes.forEach(note => this.activeNotes.add(note));
    }

    releaseNotes(notes) {
        if (!notes) return;
        this.synth.triggerRelease(notes);
        notes.forEach(note => this.activeNotes.delete(note));
    }

    releaseAll() {
        if (this.activeNotes.size > 0) {
            this.synth.triggerRelease(Array.from(this.activeNotes));
            this.activeNotes.clear();
        }
    }
}

export default PianoSynth;

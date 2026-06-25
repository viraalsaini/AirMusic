import * as Tone from 'tone';

class PianoSynth {
    constructor() {
        // We use Tone.Sampler with Salamander Grand Piano samples for the most realistic sound!
        this.synth = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                C1: "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                A1: "A1.mp3",
                C2: "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                A2: "A2.mp3",
                C3: "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                A3: "A3.mp3",
                C4: "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                A4: "A4.mp3",
                C5: "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                A5: "A5.mp3",
                C6: "C6.mp3",
                "D#6": "Ds6.mp3",
                "F#6": "Fs6.mp3",
                A6: "A6.mp3",
                C7: "C7.mp3",
                "D#7": "Ds7.mp3",
                "F#7": "Fs7.mp3",
                A7: "A7.mp3",
                C8: "C8.mp3"
            },
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            release: 1,
        }).toDestination();
        
        // Add a beautiful concert hall reverb
        this.reverb = new Tone.Reverb({
            decay: 3.5,
            preDelay: 0.01,
            wet: 0.3
        }).toDestination();
        
        this.synth.connect(this.reverb);
        this.activeNotes = new Set();
    }

    async init() {
        await Tone.start();
        await Tone.loaded(); // Wait for the grand piano samples to finish downloading
        console.log("Audio Context and Samples Loaded");
    }

    playNotes(noteNums) {
        if (!noteNums) return;
        noteNums.forEach(num => {
            // Convert MIDI integer to Tone.js frequency string (e.g. 62 -> D4)
            const noteStr = Tone.Frequency(num, "midi").toNote();
            this.synth.triggerAttack(noteStr);
            this.activeNotes.add(num);
        });
    }

    releaseNotes(noteNums) {
        if (!noteNums) return;
        noteNums.forEach(num => {
            const noteStr = Tone.Frequency(num, "midi").toNote();
            this.synth.triggerRelease(noteStr);
            this.activeNotes.delete(num);
        });
    }

    releaseAll() {
        if (this.activeNotes.size > 0) {
            const freqs = Array.from(this.activeNotes).map(n => Tone.Frequency(n, "midi").toNote());
            this.synth.triggerRelease(freqs);
            this.activeNotes.clear();
        }
    }
}

export default PianoSynth;

/**
 * Ultra-Romantic Ambient Audio Synthesizer (Pure Web Audio API)
 * Plays an emotional, dreamy piano & celesta melody with soft heartbeat pulses
 * No external MP3 files needed - 100% reliable, zero network dependency.
 */

class RomanticSoundscape {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.intervalId = null;
        this.heartbeatTimer = null;
        this.masterGain = null;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playHeartbeat(startTime) {
        if (!this.ctx || this.isMuted) return;

        // Two soft deep thumps (lub-dub)
        [0, 0.22].forEach((offset, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            const t = startTime + offset;
            
            // Sub-bass thump (55Hz dropping to 35Hz)
            osc.frequency.setValueAtTime(idx === 0 ? 60 : 50, t);
            osc.frequency.exponentialRampToValueAtTime(32, t + 0.18);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(90, t);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.4, t + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    playPianoNote(freq, startTime, duration = 3.2, gainLevel = 0.15) {
        if (!this.ctx || this.isMuted) return;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Warm blend of sine and gentle triangle
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, startTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, startTime);
        filter.frequency.exponentialRampToValueAtTime(450, startTime + duration);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.08); // Quick tender strike
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Long dreamy tail

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
    }

    playCelestaChime(freq, startTime) {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.0);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 2.0);
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;

        // Heartbeats at 2.2s and 3.4s during the cosmic heart formation
        const now = this.ctx.currentTime;
        this.playHeartbeat(now + 2.0);
        this.playHeartbeat(now + 3.2);

        // Romantic melody in D Major / B Minor
        // Gentle romantic progression
        const melodyPhrases = [
            // Phrase 1: D - F# - A - C# (Dmaj7)
            { baseDelay: 0.2, notes: [293.66, 369.99, 440.00, 554.37, 739.99] },
            // Phrase 2: B - D - F# - A (Bm7)
            { baseDelay: 3.5, notes: [246.94, 293.66, 369.99, 440.00, 587.33] },
            // Phrase 3: G - B - D - F# (Gmaj7)
            { baseDelay: 6.8, notes: [196.00, 246.94, 293.66, 369.99, 493.88] },
            // Phrase 4: A - C# - E - G (A7sus4)
            { baseDelay: 9.8, notes: [220.00, 277.18, 329.63, 440.00, 659.25] }
        ];

        melodyPhrases.forEach(phrase => {
            phrase.notes.forEach((freq, idx) => {
                this.playPianoNote(freq, now + phrase.baseDelay + idx * 0.35, 4.0, 0.12);
                if (idx === phrase.notes.length - 1) {
                    this.playCelestaChime(freq * 2, now + phrase.baseDelay + idx * 0.35);
                }
            });
        });

        // Loop the melody every 12.8 seconds
        this.intervalId = setInterval(() => {
            if (!this.isPlaying) return;
            const loopNow = this.ctx.currentTime;
            melodyPhrases.forEach(phrase => {
                phrase.notes.forEach((freq, idx) => {
                    this.playPianoNote(freq, loopNow + phrase.baseDelay + idx * 0.35, 4.0, 0.12);
                });
            });
        }, 12800);
    }

    stop() {
        this.isPlaying = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    playTempleCelebration() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;

        // Resonant Temple Chimes & Sacred Bells
        const templeBellFreqs = [587.33, 880.00, 1174.66, 1760.00];
        templeBellFreqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 3.5);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 3.6);
        });

        // Joyful celesta arpeggios
        const celestaNotes = [739.99, 880.00, 1108.73, 1174.66, 1479.98, 1760.00];
        celestaNotes.forEach((freq, idx) => {
            this.playCelestaChime(freq, now + 0.35 + idx * 0.14);
        });

        // Triumphant Warm Piano Chords (D Major)
        [now + 0.3, now + 1.6, now + 3.0].forEach((chordTime, cIdx) => {
            const chords = [
                [293.66, 369.99, 440.00, 587.33], // D Major
                [369.99, 440.00, 554.37, 739.99], // F#m / D
                [293.66, 440.00, 587.33, 880.00]  // High D octave
            ];
            chords[cIdx].forEach((freq) => {
                this.playPianoNote(freq, chordTime, 4.5, 0.18);
            });
        });
    }
}

window.soundscape = new RomanticSoundscape();

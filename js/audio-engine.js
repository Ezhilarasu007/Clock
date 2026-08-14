// Web Audio API Synthesizer for Sand Flow, Hourglass Rotation & UI Interaction SFX
class AudioEngine {
    constructor() {
        this.isMuted = false;
        this.ctx = null;
        this.sandGain = null;
        this.sandFilter = null;
        this.noiseNode = null;
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.setupSandSound();
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    setupSandSound() {
        if (!this.ctx) return;
        
        // Create 2-second pink noise buffer
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.05; // Keep soft
            b6 = white * 0.115926;
        }

        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = noiseBuffer;
        this.noiseNode.loop = true;

        this.sandFilter = this.ctx.createBiquadFilter();
        this.sandFilter.type = 'bandpass';
        this.sandFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
        this.sandFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        this.sandGain = this.ctx.createGain();
        this.sandGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);

        this.noiseNode.connect(this.sandFilter);
        this.sandFilter.connect(this.sandGain);
        this.sandGain.connect(this.ctx.destination);

        this.noiseNode.start(0);
    }

    playFlipSound() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        const now = this.ctx.currentTime;
        
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 1.2);
        osc.frequency.exponentialRampToValueAtTime(90, now + 2.5);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.5);
    }

    playClickSound() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.sandGain && this.ctx) {
            this.sandGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}
window.AudioEngine = new AudioEngine();

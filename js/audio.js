export class EngineAudio {
  constructor() {
    this.ctx = null;
    this.osc = null;
    this.osc2 = null;
    this.gain = null;
    this.filter = null;
    this.enabled = false;
  }

  start() {
    if (this.enabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0;
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 1200;
      this.filter.Q.value = 2;

      // Two oscillators for richer engine tone
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sawtooth';
      this.osc.frequency.value = 80;
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'square';
      this.osc2.frequency.value = 60;

      // Small LFO for wobble
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.value = 18;
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.value = 8;
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.osc.frequency);

      this.osc.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.gain);
      this.gain.connect(this.ctx.destination);

      this.osc.start();
      this.osc2.start();
      this.lfo.start();
      this.enabled = true;
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  }

  stop() {
    if (!this.enabled) return;
    try {
      this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
      setTimeout(() => {
        this.osc?.stop();
        this.osc2?.stop();
        this.lfo?.stop();
        this.ctx?.close();
      }, 300);
    } catch (e) { /* ignore */ }
    this.enabled = false;
  }

  setSpeed(normalizedSpeed) {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    // Frequency rises with speed
    const baseFreq = 70 + normalizedSpeed * 280;
    this.osc.frequency.setTargetAtTime(baseFreq, t, 0.05);
    this.osc2.frequency.setTargetAtTime(baseFreq * 0.6, t, 0.05);
    // Filter opens with speed for brightness
    this.filter.frequency.setTargetAtTime(600 + normalizedSpeed * 2500, t, 0.08);
    // Gain: audible but not too loud
    const targetGain = 0.05 + normalizedSpeed * 0.08;
    this.gain.gain.setTargetAtTime(targetGain, t, 0.1);
  }

  idle() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    this.osc.frequency.setTargetAtTime(70, t, 0.1);
    this.osc2.frequency.setTargetAtTime(50, t, 0.1);
    this.filter.frequency.setTargetAtTime(500, t, 0.1);
    this.gain.gain.setTargetAtTime(0.03, t, 0.1);
  }
}

// Web Audio API market ambient and upbeat afrobeat melody generator
class MarketSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private musicInterval: any = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft market stall bell chime when arriving at a shop
  playStallChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Audio autoplay policy catch
    }
  }

  // Toggle ambient market soundscape + gentle marimba market vibe
  toggle(enable?: boolean): boolean {
    this.initContext();
    if (!this.ctx || !this.masterGain) return false;

    if (enable !== undefined) {
      this.isPlaying = !enable;
    }

    if (this.isPlaying) {
      this.stop();
      this.isPlaying = false;
      return false;
    } else {
      this.start();
      this.isPlaying = true;
      return true;
    }
  }

  private start() {
    if (!this.ctx || !this.masterGain) return;

    // Upbeat gentle Afro-market marimba notes: D pentatonic (D4, E4, F#4, A4, B4, D5)
    const notes = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33];
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;

      // Play soft marimba tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';

      const note = notes[step % notes.length];
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.35);

      // Add gentle percussion shaker on offbeats
      if (step % 2 === 1) {
        this.playShaker();
      }

      step++;
    }, 280);
  }

  private playShaker() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  private stop() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  get active(): boolean {
    return this.isPlaying;
  }
}

export const soundEngine = new MarketSoundEngine();

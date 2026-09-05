/**
 * Web Audio Synthesizer & Voiceover Engine for JodoCo
 * Generates an upbeat modern creator-economy lo-fi soundtrack,
 * synchronized speech synthesis voiceover, and procedural sound effects.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isBgmPlaying = false;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private loopIntervalId: number | null = null;
  private voiceVolume = 1.0;
  private bgmVolume = 0.45;
  private sfxVolume = 0.7;
  private speechUtterance: SpeechSynthesisUtterance | null = null;
  private lastSpokenSceneId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  public setVoiceVolume(val: number) {
    this.voiceVolume = Math.max(0, Math.min(1, val));
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // --- PROCEDURAL SFX ---

  public playPop() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  }

  public playHeartPop() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.07); // A5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  public playWhoosh() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      // White noise buffer for whoosh
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const now = this.ctx.currentTime;
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.24);
      filter.Q.setValueAtTime(2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  public playSparkle() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.18, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.22);
      });
    } catch {
      // ignore
    }
  }

  public playSuccessDing() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // ignore
    }
  }

  // --- BACKGROUND MUSIC SYNTHESIZER ---

  public startBgm() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;
    this.playBgmStep = 0;
    this.scheduleBgmLoop();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.loopIntervalId) {
      window.clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
  }

  private playBgmStep = 0;

  private scheduleBgmLoop() {
    if (this.loopIntervalId) {
      window.clearInterval(this.loopIntervalId);
    }

    // 120 BPM = 0.5s per beat, 0.25s per 8th note
    const stepDurationMs = 250;

    // Chord progression: Fmaj7 (F3, A3, C4, E4), G (G3, B3, D4, G4), Em7 (E3, G3, B3, D4), Am7 (A3, C4, E4, G4)
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G
      [164.81, 196.00, 246.94, 293.66], // Em7
      [220.00, 261.63, 329.63, 392.00], // Am7
    ];

    const bassNotes = [87.31, 98.00, 82.41, 110.00]; // F2, G2, E2, A2

    this.loopIntervalId = window.setInterval(() => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      const bar = Math.floor((this.playBgmStep % 32) / 8);
      const beatInBar = this.playBgmStep % 8;
      const now = this.ctx.currentTime;

      // 1. Kick on beats 0, 4 (Quarter notes 1 and 3)
      if (beatInBar === 0 || beatInBar === 4) {
        this.playKick(now);
      }

      // 2. Crisp Snap / Snare on beats 2, 6 (Quarter notes 2 and 4)
      if (beatInBar === 2 || beatInBar === 6) {
        this.playSnare(now);
      }

      // 3. Hi-hat on every 8th note, accent on off-beats
      this.playHiHat(now, beatInBar % 2 === 1);

      // 4. Bass note on beats 0, 3, 4, 6
      if (beatInBar === 0 || beatInBar === 3 || beatInBar === 4 || beatInBar === 6) {
        const bassFreq = bassNotes[bar];
        this.playBass(now, bassFreq, beatInBar === 0 ? 0.35 : 0.2);
      }

      // 5. Electric Piano Chords on beats 0, 3, 5
      if (beatInBar === 0 || beatInBar === 3 || beatInBar === 5) {
        const chord = chords[bar];
        this.playChord(now, chord, 0.28);
      }

      // 6. Melodic high chime / bell arpeggio on beats 1, 3, 5, 7
      if (beatInBar % 2 === 1) {
        const chord = chords[bar];
        const bellFreq = chord[(this.playBgmStep % 4)] * 2;
        this.playBell(now, bellFreq);
      }

      this.playBgmStep++;
    }, stepDurationMs);
  }

  private playKick(now: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playSnare(now: number) {
    if (!this.ctx || !this.bgmGain) return;
    // Tone + noise snap
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.bgmGain);
    osc.start(now);
    osc.stop(now + 0.1);

    // Noise for acoustic snap
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.bgmGain);

    noise.start(now);
    noise.stop(now + 0.1);
  }

  private playHiHat(now: number, isAccent: boolean) {
    if (!this.ctx || !this.bgmGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isAccent ? 0.14 : 0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(now);
    noise.stop(now + 0.04);
  }

  private playBass(now: number, freq: number, duration: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playChord(now: number, notes: number[], duration: number) {
    if (!this.ctx || !this.bgmGain) return;
    notes.forEach((freq) => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    });
  }

  private playBell(now: number, freq: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // --- VOICEOVER SYNCHRONIZATION ---

  public speakScene(sceneId: number, text: string, enabled: boolean) {
    if (!enabled || this.voiceVolume <= 0) {
      this.stopVoice();
      return;
    }

    if (this.lastSpokenSceneId === sceneId) {
      return;
    }

    this.stopVoice();
    this.lastSpokenSceneId = sceneId;

    if ('speechSynthesis' in window) {
      // Conversational pacing adjustments based on scene context
      // Fast, clear, natural young Indian creator/founder delivery
      let spokenText = text;
      let rate = 1.12; // Slightly fast, clear conversational pace
      let pitch = 1.02; // Warm, natural young pitch

      // Exact delivery nuances per scene
      switch (sceneId) {
        case 1:
          // 0-3s: Fast and conversational
          spokenText = "Okay, so… what's influencer marketing?";
          rate = 1.14;
          pitch = 1.03;
          break;
        case 2:
          // 3-6s: Short, clear, complete
          spokenText = "A brand wants people to notice its product.";
          rate = 1.12;
          pitch = 1.02;
          break;
        case 3:
          // 6-10s: "So they partner with the right creator. Someone their audience already trusts."
          // Finished completely within the 4-second scene window
          spokenText = "So they partner with the right creator. Someone their audience already trusts.";
          rate = 1.16;
          pitch = 1.02;
          break;
        case 4:
          // 10-14s: Fast with tiny natural pauses
          spokenText = "The creator makes content. People see it. The brand gets noticed.";
          rate = 1.15;
          pitch = 1.02;
          break;
        case 5:
          // 14-18s: Short and punchy
          spokenText = "The brand gets reach. The creator gets paid.";
          rate = 1.12;
          pitch = 1.02;
          break;
        case 6:
          // 18-22s: Natural conversational emphasis on 'right fit'
          spokenText = "But it works best when they're the right fit.";
          rate = 1.10;
          pitch = 1.02;
          break;
        case 7:
          // 22-25s: Calm & confident final sentence, then silence for remaining logo screen time
          spokenText = "And that's JodoCo.";
          rate = 1.05;
          pitch = 1.01;
          break;
        default:
          rate = 1.12;
          pitch = 1.02;
          break;
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = this.voiceVolume;

      // Select real Indian creator / natural conversational English voice
      const voices = window.speechSynthesis.getVoices();
      
      // 1. First priority: Natural Indian English voices (young, conversational)
      const indianVoice = voices.find(
        (v) =>
          (v.lang === 'en-IN' ||
            v.lang.toLowerCase().includes('en_in') ||
            v.name.toLowerCase().includes('india') ||
            v.name.toLowerCase().includes('neerja') ||
            v.name.toLowerCase().includes('veena') ||
            v.name.toLowerCase().includes('rishi') ||
            v.name.toLowerCase().includes('heera') ||
            v.name.toLowerCase().includes('prabhat') ||
            v.name.toLowerCase().includes('ravi') ||
            v.name.toLowerCase().includes('ananya')) &&
          v.lang.startsWith('en')
      );

      // 2. Second priority: Natural, conversational warm voices
      const naturalVoice = voices.find(
        (v) =>
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Ava') ||
            v.name.includes('Serena') ||
            v.name.includes('Zoe')) &&
          v.lang.startsWith('en')
      );

      const standardEnglishVoice = voices.find((v) => v.lang.startsWith('en'));

      if (indianVoice) {
        utterance.voice = indianVoice;
      } else if (naturalVoice) {
        utterance.voice = naturalVoice;
      } else if (standardEnglishVoice) {
        utterance.voice = standardEnglishVoice;
      }

      this.speechUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }

  public resetVoiceTrack() {
    this.lastSpokenSceneId = null;
    this.stopVoice();
  }

  public stopVoice() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.speechUtterance = null;
  }
}

export const audioEngine = new AudioEngine();

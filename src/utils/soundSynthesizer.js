/* Web Audio API Synthesizer for Weather-Reactive Sound Effects */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.rainGain = null;
    this.rainFilter = null;
    this.noiseNode = null;
    this.isPlaying = false;
    this.fadeOutTimer = null;
    this.activeNodes = [];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createPinkNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
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
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    return whiteNoise;
  }

  // Continuous ambient rain (manual toggle)
  startRain(intensity = 15) {
    this.init();
    if (!this.ctx) return;
    this.resume();

    if (this.isPlaying) {
      this.updateIntensity(intensity);
      return;
    }

    this.noiseNode = this.createPinkNoise();
    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = 'lowpass';
    
    const cutoff = Math.min(8000, 1000 + intensity * 60);
    this.rainFilter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    const volume = Math.min(0.35, 0.05 + (intensity / 120) * 0.3);
    this.rainGain.gain.setValueAtTime(volume, this.ctx.currentTime);

    this.noiseNode.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);

    this.noiseNode.start();
    this.isPlaying = true;
  }

  updateIntensity(intensity) {
    if (!this.ctx || !this.isPlaying) return;
    const cutoff = Math.min(8000, 1000 + intensity * 60);
    const volume = Math.min(0.35, 0.05 + (intensity / 120) * 0.3);
    
    this.rainFilter.frequency.exponentialRampToValueAtTime(cutoff, this.ctx.currentTime + 1);
    this.rainGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1);
  }

  triggerThunder() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    
    const osc = this.ctx.createOscillator();
    const thunderGain = this.ctx.createGain();
    const thunderFilter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 2.5);

    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.setValueAtTime(200, this.ctx.currentTime);

    thunderGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    thunderGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.3);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3);

    osc.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 3);
  }

  stopRain() {
    if (!this.isPlaying) return;
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        if (this.noiseNode) {
          try { this.noiseNode.stop(); } catch (e) {}
          this.noiseNode.disconnect();
        }
        this.isPlaying = false;
      }, 500);
    }
  }

  // Stop all one-shot effects cleanly
  stopAllEffects() {
    this.activeNodes.forEach((n) => {
      try { n.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3); } catch (e) {}
    });
    this.activeNodes = [];
    if (this.fadeOutTimer) {
      clearTimeout(this.fadeOutTimer);
      this.fadeOutTimer = null;
    }
  }

  // ===================================================================
  // ONE-SHOT WEATHER RESULT SOUND EFFECTS
  // Triggered automatically when user searches a city & gets a result.
  // ===================================================================

  // 🌧️ Short rain burst effect (3-5 sec fade)
  playRainBurst(intensity = 20, durationSec = 4) {
    this.init();
    if (!this.ctx) return;
    this.resume();
    this.stopAllEffects();

    const noise = this.createPinkNoise();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = Math.min(6000, 800 + intensity * 50);
    filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const vol = Math.min(0.3, 0.08 + (intensity / 100) * 0.22);
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.4);
    gain.gain.linearRampToValueAtTime(vol * 0.8, this.ctx.currentTime + durationSec - 1.5);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + durationSec);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    noise.stop(this.ctx.currentTime + durationSec + 0.5);
    this.activeNodes.push(gain);
  }

  // ⛈️ Thunder crack + rain burst (storm result)
  playStormEffect(intensity = 50) {
    this.init();
    if (!this.ctx) return;
    this.resume();
    this.stopAllEffects();

    // Thunder crack first
    const osc = this.ctx.createOscillator();
    const tGain = this.ctx.createGain();
    const tFilter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 2);

    tFilter.type = 'lowpass';
    tFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

    tGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    tGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.15);
    tGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

    osc.connect(tFilter);
    tFilter.connect(tGain);
    tGain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 2.5);

    // Heavy rain follows after 0.3s
    setTimeout(() => {
      this.playRainBurst(intensity, 5);
    }, 300);

    this.activeNodes.push(tGain);
  }

  // 🌦️ Light drizzle patter (gentle short burst)
  playDrizzleEffect() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    this.stopAllEffects();

    const noise = this.createPinkNoise();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 2.5);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 3.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    noise.stop(this.ctx.currentTime + 4);
    this.activeNodes.push(gain);
  }

  // ☀️ Clear sky chime / sparkle (pleasant positive notification)
  playClearSkyEffect() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    this.stopAllEffects();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6 — bright major chord
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + i * 0.12;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 2);
      this.activeNodes.push(gain);
    });

    // Soft shimmer/breeze overlay
    const shimmer = this.createPinkNoise();
    const sFilter = this.ctx.createBiquadFilter();
    sFilter.type = 'highpass';
    sFilter.frequency.setValueAtTime(4000, now);

    const sGain = this.ctx.createGain();
    sGain.gain.setValueAtTime(0.001, now);
    sGain.gain.linearRampToValueAtTime(0.025, now + 0.3);
    sGain.gain.linearRampToValueAtTime(0.001, now + 2.5);

    shimmer.connect(sFilter);
    sFilter.connect(sGain);
    sGain.connect(this.ctx.destination);
    shimmer.start();
    shimmer.stop(now + 3);
    this.activeNodes.push(sGain);
  }

  // 🌬️ Windy/cloudy whoosh effect (overcast but no rain)
  playWindEffect() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    this.stopAllEffects();

    const noise = this.createPinkNoise();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    // Whoosh: sweep the filter frequency up and down
    filter.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 1);
    filter.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 2.5);
    filter.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 3.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 2);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    noise.stop(this.ctx.currentTime + 4.5);
    this.activeNodes.push(gain);
  }

  // 🔔 Generic notification ping (data loaded)
  playNotificationPing() {
    this.init();
    if (!this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  // ===================================================================
  // MASTER: Auto-select the right effect based on weather result data
  // Called after user searches a city/location and weather loads.
  // ===================================================================
  playWeatherResultEffect(weatherData) {
    if (!weatherData) return;

    const pred = weatherData.prediction || {};
    const cur = weatherData.current || {};
    const rainProb = Number(pred.calibrated_rain_probability ?? 0);
    const precipRate = Number(cur.precipitation_mmh ?? 0);
    const cloudCover = Number(cur.cloud_cover_pct ?? 0);
    const windSpeed = Number(cur.wind_speed_kmh ?? 0);

    // 1. Heavy rain / Storm (prob > 70% or active heavy precipitation)
    if (rainProb >= 70 || precipRate >= 15) {
      this.playStormEffect(Math.max(precipRate, 40));
      return;
    }

    // 2. Moderate rain (prob 40-70% or moderate precipitation)
    if (rainProb >= 40 || precipRate >= 2) {
      this.playRainBurst(Math.max(precipRate, 15), 4);
      return;
    }

    // 3. Light drizzle (prob 20-40% or light precipitation)
    if (rainProb >= 20 || (precipRate > 0 && precipRate < 2)) {
      this.playDrizzleEffect();
      return;
    }

    // 4. Cloudy/windy but dry (high cloud cover or strong wind, no rain)
    if (cloudCover >= 60 || windSpeed >= 25) {
      this.playWindEffect();
      return;
    }

    // 5. Clear sky / Sunny (default)
    this.playClearSkyEffect();
  }
}

export const audioSynth = new SoundSynthesizer();

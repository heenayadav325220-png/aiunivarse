// Cosmic UI Synthesizer Sound Engine using Web Audio API
// Fully autonomous, lazy-loaded, and highly responsive to user interactions.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if suspended (common browser autoplay security protection)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a discrete, ultra-short futuristic click sound.
 * Engineered to be extremely subtle, with a high frequencies and fast envelope.
 */
export function playNavClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Master Gain
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    // Extremely subtle volume (clicks shouldn't scare or fatigue users)
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    
    // Quick pitch sweep downward for a soft organic feel
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

    // Filter to remove lower frequencies and keep it crisp
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, now);

    // Patch connections
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (error) {
    console.warn("Audio click playback suspended/blocked by browser policies:", error);
  }
}

/**
 * Plays a pleasant, ascending double chime sound.
 * Represents successful data saves, downloads, or asset acquisitions.
 */
export function playSaveSuccess() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master Gain
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    // Two voice oscillators for a richer, shimmering cosmic tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    
    // Chime Note 1
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(783.99, now + 0.08); // G5 (Perfect fifth jump)

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    
    // Chime Note 2 for harmony (Major triad feeling)
    osc2.frequency.setValueAtTime(659.25, now + 0.02); // E5
    osc2.frequency.setValueAtTime(1046.50, now + 0.10); // C6 (Octave resolve)

    // Detune slightly for an atmospheric chorus texture
    osc1.detune.setValueAtTime(-4, now);
    osc2.detune.setValueAtTime(4, now);

    // Lowpass filter to keep the chime warm and buttery rather than harsh/tinny
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    // Patch connections
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (error) {
    console.warn("Audio success playback suspended/blocked by browser policies:", error);
  }
}

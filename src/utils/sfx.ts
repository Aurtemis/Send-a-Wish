let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function unlockAudio() {
  const audioCtx = getAudioContext();
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

/**
 * Placeholder candle-blowout sound: a filtered-noise "whoosh" plus a light
 * chime, synthesized with Web Audio so there's no file to ship. To swap in
 * a real recording later, replace this body with e.g.
 * `new Audio("/sfx/blowout.mp3").play();`
 */
export function playBlowoutSound() {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
    if (audioCtx.state === "suspended") return;
  }

  const now = audioCtx.currentTime;
  const duration = 0.55;
  const bufferSize = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(180, now + duration);
  filter.Q.value = 0.7;

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.5, now + 0.06);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(filter).connect(noiseGain).connect(audioCtx.destination);
  noise.start(now);
  noise.stop(now + duration);

  [880, 1320].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = audioCtx.createGain();
    const start = now + 0.28 + i * 0.07;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}
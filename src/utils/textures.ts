import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

function fromCanvas(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}

/** Soft radial glow used for the flame sprite. Warm core, transparent edge. */
export function flameTexture(): THREE.Texture {
  return fromCanvas("flame", 128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s * 0.62, 0, s / 2, s * 0.55, s * 0.5);
    g.addColorStop(0, "rgba(255,255,235,1)");
    g.addColorStop(0.25, "rgba(255,210,110,0.95)");
    g.addColorStop(0.55, "rgba(255,140,40,0.55)");
    g.addColorStop(1, "rgba(255,90,20,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

/** Soft puff used for smoke particles. */
export function smokeTexture(): THREE.Texture {
  return fromCanvas("smoke", 128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(220,215,210,0.55)");
    g.addColorStop(0.6, "rgba(180,175,170,0.25)");
    g.addColorStop(1, "rgba(150,145,140,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

/** Soft round sprite used for confetti sparkle / balloon highlight. */
export function softDotTexture(): THREE.Texture {
  return fromCanvas("dot", 64, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

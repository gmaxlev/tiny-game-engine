export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lerp(a, b, t) {
  const fix = Math.max(0, Math.min(t, 1));
  return (1 - fix) * a + fix * b;
}

export const PI_OVER_180 = Math.PI / 180;

/**
 * Returns a random integer
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min, max, digits = 4) {
  return Number((Math.random() * (max - min) + min).toFixed(digits));
}

export function lerp(a, b, t) {
  const fix = Math.max(0, Math.min(t, 1));
  return (1 - fix) * a + fix * b;
}

export function limitNumber(from, to, number) {
  return Math.max(from, Math.min(to, number));
}

export const PI_OVER_180 = Math.PI / 180;

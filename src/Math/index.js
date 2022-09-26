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

export function lerp(a, b, t) {
  const fix = Math.max(0, Math.min(t, 1));
  return (1 - fix) * a + fix * b;
}

export const PI_OVER_180 = Math.PI / 180;

export function isInt(number) {
  return Number(number) === number && number % 1 === 0;
}

export function isFloat(number) {
  return Number(number) === number && number % 1 !== 0;
}

export function isNumber(number) {
  return isInt(number) || isFloat(number);
}

export function toNumber(string) {
  if (isNumber(string)) {
    return string;
  }
  const number = Number(string);
  return isNumber(number) ? number : 0;
}

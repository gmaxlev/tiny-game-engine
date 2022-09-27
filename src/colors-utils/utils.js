import { lerp } from "../Math";
import { isNumber, toNumber } from "../utils";

/* eslint no-shadow: 0 */

/**
 * RGBA array
 * @typedef {[number, number, number, number]} ColorValue
 */

/**
 * Tries to parse color as string value
 * @param {string|*} string
 * @returns {ColorValue|null}
 */
function tryResolveString(string) {
  if (typeof string !== "string") {
    return null;
  }

  string = string.replace(/\s+/g, "");

  const values = [
    ...string.matchAll(/^rgba?\((\d+),(\d+),(\d+)(,(0\.\d+|\d+))?\)$/g),
  ];

  if (!values.length) {
    return null;
  }

  const [, r, g, b, , a = 1] = values[0];
  return [Number(r), Number(g), Number(b), Number(a)];
}

/**
 * Tries to parse color as an array
 * @param {[number, number, number, number]|*} array
 * @returns {ColorValue|null}
 */
function tryResolveArray(array) {
  if (!Array.isArray(array) || (array.length !== 3 && array.length !== 4)) {
    return null;
  }
  const [red, green, blue, alpha = 1] = array;
  return [red, green, blue, alpha];
}

/**
 * Tries to parse color as an object
 * @param {{red: number, greed: number, blue: number, alpha: number}|*} object
 * @returns {ColorValue|null}
 */
function tryResolveObject(object) {
  if (
    typeof object !== "object" ||
    object === null ||
    object instanceof Array
  ) {
    return null;
  }
  const { red, green, blue, alpha = 1 } = object;
  return [red, green, blue, alpha];
}

/**
 * Receives parsed array and normalizes it
 * @param {ColorValue} color
 * @returns {ColorValue}
 */
export function normalizeColor(color) {
  let normalizedArray;

  if (!Array.isArray(color) || color.length !== 4) {
    normalizedArray = Array.from(new Array(4));
  } else {
    normalizedArray = color;
  }

  return normalizedArray.map((item, index) => {
    const number = isNumber(item) ? item : toNumber(item);

    if (index < 3) {
      return Math.max(0, Math.min(255, number));
    }
    return Math.max(0, Math.min(1, number));
  });
}

/**
 * Receives a user-friendly color, tries to parse it and returns
 * {@link ColorValue} to manipulate it further easily and fast
 * @param {*} color
 * @returns {ColorValue}
 */
export function resolveColor(color) {
  const rgba = tryResolveString(color);

  if (rgba) {
    return normalizeColor(rgba);
  }

  const array = tryResolveArray(color);

  if (array) {
    return normalizeColor(array);
  }

  const object = tryResolveObject(color);

  if (object) {
    return normalizeColor(object);
  }

  throw new TypeError(`Incorrect color format: ${color}`);
}

/**
 * Returns RGBA string of a color
 * @param color
 * @returns {string}
 */
export function toRGBA(color) {
  const [red, green, blue, alpha] = resolveColor(color);
  return `rgba(${red},${green},${blue},${alpha})`;
}

/**
 * Changes alpha of a color
 * @param {*} color
 * @param {number} a The number from 0 to 1
 * @returns {ColorValue}
 */
export function alpha(color, a) {
  const [red, green, blue] = resolveColor(color);
  return [red, green, blue, Math.max(0, Math.min(1, a))];
}

/**
 * Lightens a color
 * @param {*} color
 * @param {number} c The number from 0 to 1
 * @returns {ColorValue}
 */
export function lighten(color, c) {
  const [red, green, blue, alpha] = resolveColor(color);
  return [
    red + (255 - red) * c,
    green + (255 - green) * c,
    blue + (255 - blue) * c,
    alpha,
  ];
}

/**
 * Darkens color
 * @param {*} color
 * @param {number} c The number from 0 to 1
 * @returns {ColorValue}
 */
export function darken(color, c) {
  const [red, green, blue, alpha] = resolveColor(color);
  return [red - red * c, green - green * c, blue - blue * c, alpha];
}

/**
 * Color interpolation
 * @param {*} color1
 * @param {*} color2
 * @param t
 * @returns {ColorValue}
 */
export function colorLerp(color1, color2, t) {
  const [color1red, color1green, color1blue, color1alpha] =
    resolveColor(color1);
  const [color2red, color2green, color2blue, color2alpha] =
    resolveColor(color2);
  return [
    lerp(color1red, color2red, t),
    lerp(color1green, color2green, t),
    lerp(color1blue, color2blue, t),
    lerp(color1alpha, color2alpha, t),
  ];
}

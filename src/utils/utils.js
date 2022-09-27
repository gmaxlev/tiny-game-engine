import { getRandomInt } from "../math-utils";

/**
 * Returns a random element of an array
 * @param array
 * @returns {*}
 */
export function getRandomElement(array) {
  return array[getRandomInt(0, array.length - 1)];
}

/**
 * Receives functions or values and calls them in order
 * Each received or returned value is passed to the next function
 * It's used to reduce code and improve code readability
 * @param rest
 * @returns {*}
 */
export function pipe(...rest) {
  return rest.reduce((value, item) => {
    if (typeof item === "function") {
      return item(value);
    }
    return item;
  }, undefined);
}

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

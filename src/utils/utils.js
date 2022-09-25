import { getRandomInt } from "../Math";

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

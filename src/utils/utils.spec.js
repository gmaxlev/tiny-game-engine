import { getRandomElement, pipe } from "./utils";

describe("utils.js", () => {
  test("getRandomElement()", () => {
    const array = ["1", 2, [], {}];
    const result = getRandomElement(array);
    expect(array).toContain(result);
  });
  test("pipe()", () => {
    expect(
      pipe(
        "string",
        (value) => value.toUpperCase(),
        (value) => value.slice(3)
      )
    ).toBe("ING");
  });
});

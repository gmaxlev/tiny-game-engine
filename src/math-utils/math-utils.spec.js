import { limitNumber } from "./index";

describe("math-utils.js", () => {
  describe("limitNumber()", () => {
    const forCheck = [
      {
        input: [0, 1, 1],
        output: 1,
      },
      {
        input: [0, 1, 2],
        output: 1,
      },
      {
        input: [0, 1, 0.5],
        output: 0.5,
      },
      {
        input: [0, 1, 0],
        output: 0,
      },
      {
        input: [0, 1, 0],
        output: 0,
      },
      {
        input: [0, 1, -1],
        output: 0,
      },
    ];

    test.each(forCheck)("something", ({ input, output }) => {
      const [from, to, number] = input;
      expect(limitNumber(from, to, number)).toBe(output);
    });
  });
});

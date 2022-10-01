import { buildCanvasFont, getRandomElement, pipe } from "./utils";

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
  test("buildCanvasFont()", () => {
    expect(buildCanvasFont()).toBe("16px");
    expect(buildCanvasFont({})).toBe("16px");
    expect(buildCanvasFont({ fontSize: "10px" })).toBe("10px");
    expect(
      buildCanvasFont({ fontSize: "20px", fontFamily: "RubikMonoOne" })
    ).toBe("20px RubikMonoOne");
    expect(
      buildCanvasFont({
        fontSize: "20px",
        fontFamily: "RubikMonoOne",
        fontWeight: "semibold",
      })
    ).toBe("semibold 20px RubikMonoOne");
  });
});

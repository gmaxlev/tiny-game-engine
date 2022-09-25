import {
  alpha,
  colorLerp,
  darken,
  lighten,
  normalizeColor,
  resolveColor,
  toRGBA,
} from "./utils";

describe("Colors", () => {
  describe("Resolve", () => {
    describe("RGB", () => {
      test("Should be resolved", () => {
        expect(resolveColor("rgb(100,50,50)")).toEqual([100, 50, 50, 1]);
        expect(resolveColor("rgb(100,50,50,0)")).toEqual([100, 50, 50, 0]);
        expect(resolveColor("rgb(100,50,50,0.5)")).toEqual([100, 50, 50, 0.5]);
        expect(resolveColor("rgb(0,0,0,0.33333)")).toEqual([0, 0, 0, 0.33333]);
      });
      test("Should throws an error", () => {
        expect(() => resolveColor()).toThrow(TypeError);
        expect(() => resolveColor('rgba("0","100","0")')).toThrow(TypeError);
        expect(() => resolveColor("rgba(255)")).toThrow(TypeError);
        expect(() => resolveColor("rgba(255,255,255,)")).toThrow(TypeError);
        expect(() => resolveColor("rgba(255A,255,255,)")).toThrow(TypeError);
        expect(() => resolveColor("rgba(255,255,255,A)")).toThrow(TypeError);
      });
    });
    describe("Array", () => {
      test("Should be resolved", () => {
        expect(resolveColor([50, 12, 33])).toEqual([50, 12, 33, 1]);
        expect(resolveColor([50, 12, 33, 1])).toEqual([50, 12, 33, 1]);
        expect(resolveColor([50, 12, 33, 0.5])).toEqual([50, 12, 33, 0.5]);
      });
      test("Should throws an error", () => {
        expect(() => resolveColor([])).toThrow(TypeError);
        expect(() => resolveColor([100, 100, 100, 100, 100])).toThrow(
          TypeError
        );
      });
    });
    test("Object", () => {
      expect(resolveColor({ red: 0, green: 200, blue: 12, alpha: 0 })).toEqual([
        0, 200, 12, 0,
      ]);
      expect(resolveColor({ red: 0, green: 200, blue: 12 })).toEqual([
        0, 200, 12, 1,
      ]);
    });
  });
  describe("Normalize", () => {
    test("test", () => {
      expect(normalizeColor([])).toEqual([0, 0, 0, 0]);
      expect(normalizeColor([1, 2, 3, 1])).toEqual([1, 2, 3, 1]);
      expect(normalizeColor([1, 2, 3, 11])).toEqual([1, 2, 3, 1]);
      expect(normalizeColor([1, 2, 3, -0.01])).toEqual([1, 2, 3, 0]);
      expect(normalizeColor([256, 2, 3, -0.01])).toEqual([255, 2, 3, 0]);
      expect(normalizeColor(["256", 2, 3, -0.01])).toEqual([255, 2, 3, 0]);
      expect(normalizeColor(["256", "2", "3", "0.5"])).toEqual([
        255, 2, 3, 0.5,
      ]);
    });
  });
  describe("Convert", () => {
    test("toRGBA()", () => {
      expect(toRGBA("rgba(255,200,255)")).toBe("rgba(255,200,255,1)");
      expect(toRGBA([255, 255, 255])).toBe("rgba(255,255,255,1)");
      expect(toRGBA({ red: 200, green: 255, blue: 255 })).toBe(
        "rgba(200,255,255,1)"
      );
    });
    test("alpha()", () => {
      expect(alpha([255, 255, 255], 0)).toEqual([255, 255, 255, 0]);
      expect(alpha([255, 255, 255], 0.4)).toEqual([255, 255, 255, 0.4]);
      expect(alpha([255, 200, 255], 1)).toEqual([255, 200, 255, 1]);
      expect(alpha([255, 200, 255], -1)).toEqual([255, 200, 255, 0]);
    });
    test("lighten()", () => {
      expect(lighten("rgb(0,0,0)", 1)).toEqual([255, 255, 255, 1]);
      expect(lighten("rgb(0,0,0)", 0.5)).toEqual([127.5, 127.5, 127.5, 1]);
      expect(lighten("rgb(255,254,255)", 0.5)).toEqual([255, 254.5, 255, 1]);
      expect(lighten("rgb(255,255,255)", 0.5)).toEqual([255, 255, 255, 1]);
      expect(lighten("rgb(255,255,255)", 0)).toEqual([255, 255, 255, 1]);
      expect(lighten("rgb(255,255,255)", 1)).toEqual([255, 255, 255, 1]);
      expect(lighten("rgb(255,255,255)", 0.5)).toEqual([255, 255, 255, 1]);
    });
    test("darken()", () => {
      expect(darken("rgb(0,0,0)", 1)).toEqual([0, 0, 0, 1]);
      expect(darken("rgb(0,0,0)", 0)).toEqual([0, 0, 0, 1]);
      expect(darken("rgb(0,0,0)", 0.5)).toEqual([0, 0, 0, 1]);
      expect(darken("rgb(255,255,255)", 1)).toEqual([0, 0, 0, 1]);
      expect(darken("rgb(255,255,255)", 0.5)).toEqual([127.5, 127.5, 127.5, 1]);
      expect(darken("rgb(255,0,255)", 0.5)).toEqual([127.5, 0, 127.5, 1]);
    });
    test("colorLerp()", () => {
      expect(colorLerp("rgba(0,0,0,1)", "rgba(255,255,255,1)", 0.5)).toEqual([
        127.5, 127.5, 127.5, 1,
      ]);
      expect(colorLerp("rgba(0,0,0,1)", "rgba(255,0,0,1)", 0.25)).toEqual([
        63.75, 0, 0, 1,
      ]);
      expect(colorLerp("rgba(0,0,0,1)", "rgba(255,0,0,1)", 1)).toEqual([
        255, 0, 0, 1,
      ]);
      expect(colorLerp("rgba(0,0,0,1)", "rgba(0,255,0,1)", 1)).toEqual([
        0, 255, 0, 1,
      ]);
      expect(colorLerp("rgba(0,0,0,1)", "rgba(0,0,255,1)", 1)).toEqual([
        0, 0, 255, 1,
      ]);
      expect(colorLerp("rgba(0,0,0,0)", "rgba(0,0,0,1)", 1)).toEqual([
        0, 0, 0, 1,
      ]);
      expect(colorLerp("rgba(0,0,0,0)", "rgba(0,0,0,1)", 0.8)).toEqual([
        0, 0, 0, 0.8,
      ]);
    });
  });
  // test("pipeColor()", () => {
  //   expect(
  //     pipeColor(
  //       alpha("rgba(255,0,0)", 0.5),
  //       (value) => alpha(value, 1),
  //       (value) => darken(value, 1),
  //       (value) => lighten(value, 0.5),
  //       (value) => toRGBA(value)
  //     )
  //   ).toBe("rgba(127.5,127.5,127.5,1)");
  // });
});

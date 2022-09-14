import { GameObject } from "./GameObject";

describe("GameObjectNode", () => {
  /** @type {GameObject} */
  let instance1;
  /** @type {GameObject} */
  let instance2;
  /** @type {GameObject} */
  let instance3;
  /** @type {GameObject} */
  let instance4;
  /** @type {GameObject} */
  let instance5;

  const MARK_1 = Symbol("MARK_1");
  const MARK_2 = Symbol("MARK_2");
  const MARK_3 = Symbol("MARK_3");
  const MARK_4 = Symbol("MARK_4");
  const MARK_5 = Symbol("MARK_5");

  beforeEach(() => {
    instance1 = new GameObject();
    instance2 = new GameObject();
    instance3 = new GameObject();
    instance4 = new GameObject();
    instance5 = new GameObject();
  });

  test("Creating an instance", () => {
    expect(instance1).toBeInstanceOf(GameObject);
  });

  describe("Marks", () => {
    describe("Adding", () => {
      test("Add a mark with Infinity frames", () => {
        instance1.markForUpdate(MARK_1, Infinity);
        expect(instance1._marksForUpdate.self.has(MARK_1)).toBe(true);
      });

      test("Add a mark with the amount of frames", () => {
        instance1.markForUpdate(MARK_1, 12);
        expect(instance1._marksForUpdate.self.has(MARK_1)).toBe(true);
        expect(instance1._marksForUpdate.self.get(MARK_1)).toBe(12);
      });

      test("Repeated adding should be ignored", () => {
        instance1.markForUpdate(MARK_1, 5);
        instance1.markForUpdate(MARK_1, 5);
        expect(instance1._marksForUpdate.self.has(MARK_1)).toBe(true);
        expect(instance1._marksForUpdate.self.get(MARK_1)).toBe(5);
      });
    });

    describe("Removing", () => {
      test("Removing existing mark", () => {
        instance1.markForUpdate(MARK_1, Infinity);
        instance1.unmarkForUpdate(MARK_1);
        expect(instance1._marksForUpdate.self.has(MARK_1)).toBe(false);
      });

      test("Removing not existing mark should be ignored", () => {
        instance1.unmarkForUpdate(MARK_1);
        expect(instance1._marksForUpdate.self.has(MARK_1)).toBe(false);
      });

      test("Repeated removing mark should be ignored", () => {
        instance1.markForUpdate(MARK_1, Infinity);
        instance1.unmarkForUpdate(MARK_1);
        instance1.unmarkForUpdate(MARK_1);
        expect(instance1._marksForUpdate.self.has(MARK_1)).toBe(false);
      });

      test("Clear all marks", () => {
        instance1.markForUpdate(MARK_1, Infinity);
        instance1.markForUpdate(MARK_2, Infinity);
        instance1.markForUpdate(MARK_3, Infinity);
        instance1.markForUpdate(MARK_4, Infinity);
        instance1.markForUpdate(MARK_5, Infinity);
        expect(instance1._marksForUpdate.self.size).toBe(5);
        instance1.clearMarksForUpdate();
        expect(instance1._marksForUpdate.self.size).toBe(0);
      });
    });
  });
});

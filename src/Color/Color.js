import { lerp } from "../Math";

export class Color {
  constructor(r, g, b, a = 1) {
    this.color = [r, g, b, a];
    this._toStringCache = null;
  }

  get red() {
    return this.color[0];
  }

  get green() {
    return this.color[1];
  }

  get blue() {
    return this.color[2];
  }

  get alpha() {
    return this.color[3];
  }

  set(r, g, b, a = 1) {
    this.color[0] = r;
    this.color[1] = g;
    this.color[2] = b;
    this.color[3] = a;
    this._resetCache();
  }

  toString() {
    if (this._toStringCache) {
      return this._toStringCache;
    }
    this._toStringCache = `rgba(${this.red},${this.green},${this.blue},${this.alpha})`;
    return this._toStringCache;
  }

  _resetCache() {
    this._toStringCache = null;
  }

  static lerp(color1, color2, t) {
    return [
      Math.round(lerp(color1.red, color2.red, t)),
      Math.round(lerp(color1.green, color2.green, t)),
      Math.round(lerp(color1.blue, color2.blue, t)),
      Math.round(lerp(color1.alpha, color2.alpha, t)),
    ];
  }
}

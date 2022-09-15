import { lerp } from "../Math";

export class Color {
  constructor(...rest) {
    if (rest.length === 1) {
      const [color] = rest;
      this.color = [color.red, color.green, color.blue, color.alpha];
    } else {
      const [r, g, b, a = 0] = rest;
      this.color = [r, g, b, a];
    }
    this._toStringCache = null;
  }

  set red(value) {
    this._resetCache();
    this.color[0] = value;
  }

  get red() {
    return this.color[0];
  }

  set green(value) {
    this._resetCache();
    this.color[1] = value;
  }

  get green() {
    return this.color[1];
  }

  set blue(value) {
    this._resetCache();
    this.color[2] = value;
  }

  get blue() {
    return this.color[2];
  }

  set alpha(value) {
    this._resetCache();
    this.color[3] = value;
  }

  get alpha() {
    return this.color[3];
  }

  setAlpha(alpha) {
    this.alpha = alpha;
    return this;
  }

  lighten(c) {
    this.red += (255 - this.red) * c;
    this.green += (255 - this.green) * c;
    this.blue += (255 - this.blue) * c;
    return this;
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

export class Bezier {
  constructor(curves) {
    this.curves = curves;
    this.type =
      curves.length === 2
        ? Bezier.TYPES.LINEAR
        : curves.length === 3
        ? Bezier.TYPES.QUADRATIC
        : curves.length === 4
        ? Bezier.TYPES.CUBIC
        : null;
    this.getPoint = this.getPoint.bind(this);
    if (this.type === null) {
      throw new Error("Bezier error");
    }
  }

  getPointInLineCurve(t) {
    if (typeof this.curves[0] === "object") {
      return {
        x: Bezier.computePointLineCurve(t, this.curves[0].x, this.curves[1].x),
        y: Bezier.computePointLineCurve(t, this.curves[0].y, this.curves[1].y),
      };
    }
    return (1 - t) * this.curves[0] + t * this.curves[1];
  }

  getPointInSquareCurve(t) {
    if (typeof this.curves[0] === "object") {
      return {
        x: Bezier.computePointSquareCurve(
          t,
          this.curves[0].x,
          this.curves[1].x,
          this.curves[2].x
        ),
        y: Bezier.computePointSquareCurve(
          t,
          this.curves[0].y,
          this.curves[1].y,
          this.curves[2].y
        ),
      };
    }
    return Bezier.computePointSquareCurve(
      t,
      this.curves[0],
      this.curves[1],
      this.curves[2]
    );
  }

  getPointInCubicCurve(t) {
    if (typeof this.curves[0] === "object") {
      return {
        x: Bezier.computePointCubicCurve(
          t,
          this.curves[0].x,
          this.curves[1].x,
          this.curves[2].x,
          this.curves[3].x
        ),
        y: Bezier.computePointCubicCurve(
          t,
          this.curves[0].y,
          this.curves[1].y,
          this.curves[2].y,
          this.curves[3].y
        ),
      };
    }
    return Bezier.computePointCubicCurve(
      t,
      this.curves[0],
      this.curves[1],
      this.curves[2],
      this.curves[3]
    );
  }

  getLength() {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", this.toSVG());
    return path.getTotalLength();
  }

  toSVG() {
    const s = ["M", this.curves[0].x, this.curves[0].y];

    if (this.type === Bezier.TYPES.LINEAR) {
      s.push("L");
      s.push(this.curves[1].x);
      s.push(this.curves[1].y);
    } else {
      s.push(this.type === Bezier.TYPES.QUADRATIC ? "Q" : "C");

      for (let i = 1; i < this.curves.length; i++) {
        s.push(this.curves[i].x);
        s.push(this.curves[i].y);
      }
    }

    return s.join(" ");
  }

  getPoint(t) {
    if (this.type === Bezier.TYPES.LINEAR) {
      return this.getPointInLineCurve(t);
    }

    if (this.type === Bezier.TYPES.QUADRATIC) {
      return this.getPointInSquareCurve(t);
    }

    if (this.type === Bezier.TYPES.CUBIC) {
      return this.getPointInCubicCurve(t);
    }
  }

  static TYPES = {
    LINEAR: 0,
    QUADRATIC: 1,
    CUBIC: 2,
  };

  static computePointCubicCurve(t, c1, c2, c3, c4) {
    return (
      (1 - t) ** 3 * c1 +
      3 * (1 - t) ** 2 * t * c2 +
      3 * (1 - t) * t ** 2 * c3 +
      t ** 3 * c4
    );
  }

  static computePointSquareCurve(t, c1, c2, c3) {
    return (1 - t) ** 2 * c1 + 2 * (1 - t) * t * c2 + t ** 2 * c3;
  }

  static computePointLineCurve(t, c1, c2) {
    return (1 - t) * c1 + t * c2;
  }
}

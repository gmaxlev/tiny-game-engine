export class PolyBezier {
  constructor(beziers) {
    this.beziers = beziers;
    this.length = this.beziers.reduce(
      (acc, current) => acc + current.getLength(),
      0
    );
    this.lengths = this.beziers.map(
      (bezier) => bezier.getLength() / this.length
    );
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.path.setAttribute("d", this.toSVG());
    this.getPoint = this.getPoint.bind(this);
  }

  getPoint(t) {
    for (let i = 0, offset = 0; i < this.beziers.length; i++) {
      if (t <= this.lengths[i] + offset) {
        const progress = (t - offset) / this.lengths[i];
        return this.beziers[i].getPoint(progress);
      }
      offset += this.lengths[i];
    }
  }

  getPointAtLength(distance) {
    return this.path.getPointAtLength(distance);
  }

  toSVG() {
    return this.beziers
      .reduce((acc, current) => {
        acc.push(current.toSVG());
        return acc;
      }, [])
      .join(" ");
  }
}

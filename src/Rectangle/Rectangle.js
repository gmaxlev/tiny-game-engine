export class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  scale(width, height) {
    this.width *= width;
    this.height *= height;
    return this;
  }

  copy() {
    return new Rectangle(this.width, this.height);
  }
}

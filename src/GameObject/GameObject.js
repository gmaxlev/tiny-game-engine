import { EventEmitter } from "../EventEmitter";
import { Rectangle } from "../Rectangle";

/**
 * Simple game object
 */
export class GameObject {
  constructor({ width = 300, height = 300, visible = true }) {
    this.events = new EventEmitter();
    this.size = new Rectangle(width, height);
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.visible = visible;
    this._destroyed = false;
  }

  draw() {}

  drawTo(ctx, x, y) {
    if (this.visible) {
      this.draw();
      ctx.drawImage(this.canvas, x, y);
    }
  }
}

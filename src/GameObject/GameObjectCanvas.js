import { GameObject } from "./GameObject";
import { GameObjectPure } from "./GameObjectPure";
import { Rectangle } from "../Rectangle";

/**
 * GameObject with the canvas
 */
export class GameObjectCanvas extends GameObject {
  static MARKS = {
    SINGLE: Symbol("SINGLE"),
  };

  constructor({ width = 300, height = 300 } = {}) {
    super();
    this.size = new Rectangle(width, height);
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Clears the canvas before each frame
   */
  clear() {
    if (this._destroyed) {
      return;
    }

    this.ctx.clearRect(0, 0, this.size.width, this.size.height);
  }

  /**
   * Draws GameObjectCanvas or GameObjectPure
   * @param {GameObjectCanvas|GameObjectPure} entity
   * @param {number} [x=0]
   * @param {number} [y=0]
   */
  draw(entity, x = 0, y = 0) {
    if (this._destroyed) {
      return;
    }

    if (entity instanceof GameObjectCanvas) {
      if (entity.update()) {
        entity.clear();
        entity.render();
      }
      this.ctx.drawImage(entity.canvas, x, y);
    } else if (entity instanceof GameObjectPure) {
      if (entity.update()) {
        entity.render(this.ctx, x, y);
      }
    }
  }

  /**
   * Renders a frame
   * @interface
   */
  render() {}
}

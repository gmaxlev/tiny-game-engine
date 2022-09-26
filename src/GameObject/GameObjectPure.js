import { GameObject } from "./GameObject";

export class GameObjectPure extends GameObject {
  static MARKS = {
    SINGLE: Symbol("SINGLE"),
  };

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameObjectPure} gameObject
   * @param {number} x
   * @param {number} y
   */
  draw(ctx, gameObject, x = 0, y = 0) {
    if (this._destroyed) {
      return;
    }

    if (gameObject instanceof GameObjectPure) {
      if (gameObject.update()) {
        gameObject.render(this.ctx, x, y);
      }
    }
  }
}

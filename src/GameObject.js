import { EventEmitter } from "./EventEmitter";
import { Rectangle } from "./Rectangle";

import { Unsubscribes } from "./Unsubscribes";
import { Destroyings } from "./Destroyings";

export class GameObject {
  static EVENTS = {
    MARK_FOR_UPDATE: Symbol("MARK_FOR_UPDATE"),
    UNMARK_FOR_UPDATE: Symbol("UNMARK_FOR_UPDATE"),
    BEFORE_DESTROYING: Symbol("BEFORE_DESTROYING"),
  };

  static STATES = {
    SHOWN: 0,
    HIDDEN: 1,
  };

  constructor({ width = 300, height = 300 }) {
    this.events = new EventEmitter();
    this.unsubscribes = new Unsubscribes();
    this.destroyings = new Destroyings();
    this.size = new Rectangle(width, height);
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.marksForUpdate = 0;
    this.marksFramesForUpdate = 0;
    this._state = GameObject.STATES.SHOWN;
    this._connected = 0;
    this._connectedMap = new WeakMap();
    this._destroyed = false;
  }

  /** @param {GameObject} gameObject */
  connect(gameObject) {
    gameObject._connected += 1;

    const unsubscribes = new Unsubscribes();

    this._connectedMap.set(gameObject, unsubscribes);

    unsubscribes.add([
      gameObject.events.subscribe(
        GameObject.EVENTS.MARK_FOR_UPDATE,
        (count) => {
          this.markForUpdate(count);
        }
      ),
      gameObject.events.subscribe(
        GameObject.EVENTS.UNMARK_FOR_UPDATE,
        (count) => {
          this.unmarkForUpdate(count);
        }
      ),

      gameObject.events.subscribe(GameObject.EVENTS.BEFORE_DESTROYING, () => {
        this.disconnect(gameObject);
      }),

      this.events.subscribe(GameObject.EVENTS.BEFORE_DESTROYING, () => {
        this.disconnect(gameObject);
        gameObject.destroy(true);
      }),
    ]);

    if (gameObject.marksForUpdate) {
      this.markForUpdate(gameObject.marksForUpdate);
    }

    gameObject._connected = true;
  }

  disconnect(gameObject) {
    const unsubscribes = this._connectedMap.get(gameObject);
    unsubscribes.call();
    gameObject._connected -= 0;

    if (gameObject.marksForUpdate) {
      this.unmarkForUpdate(gameObject.marksForUpdate);
    }

    return this._connectedMap.delete(gameObject);
  }

  markForUpdate(count = 1) {
    this.marksForUpdate += count;
    this.events.emit(GameObject.EVENTS.MARK_FOR_UPDATE, count);
  }

  markForUpdateIfDont() {
    if (this.marksForUpdate === 0) {
      this.markForUpdate();
    }
  }

  unmarkForUpdate(count = 1) {
    if (this.marksForUpdate === 0) {
      console.warn("Can not call unmarkForUpdate() with 0 marksForUpdate");
      return;
    }
    this.marksForUpdate -= count;
    this.events.emit(GameObject.EVENTS.UNMARK_FOR_UPDATE, count);
  }

  unmarkForUpdateIfDo() {
    if (this.marksForUpdate) {
      this.unmarkForUpdate();
    }
  }

  markFramesForUpdate(count = 1) {
    if (count > this.marksFramesForUpdate) {
      if (this.marksFramesForUpdate === 0) {
        this.markForUpdate();
      }
      this.marksFramesForUpdate = count;
    }
  }

  draw() {}

  update() {
    if (this.marksForUpdate) {
      this.clear();
      this.draw();
      if (this.marksFramesForUpdate > 0) {
        this.marksFramesForUpdate -= 1;
        if (this.marksFramesForUpdate === 0) {
          this.unmarkForUpdate();
        }
      }
    }
    return this.canvas;
  }

  setState(state) {
    this._state = state;
  }

  drawTo(ctx, x = 0, y = 0) {
    if (this._state === GameObject.STATES.SHOWN) {
      ctx.drawImage(this.update(), x, y);
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);
  }

  destroy(isConnected) {
    if ((isConnected && this._connected > 1) || this._destroyed) {
      return;
    }
    this.events.emit(GameObject.EVENTS.BEFORE_DESTROYING);
    this.unsubscribes.call();
    this.destroyings.call();
    this.events.clear();
    if (!isConnected && this.marksForUpdate > 0) {
      this.unmarkForUpdate(this.marksForUpdate);
    }
    this._destroyed = true;
  }
}

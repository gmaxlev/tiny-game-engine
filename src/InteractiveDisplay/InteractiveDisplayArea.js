import { InteractiveDisplay } from "./InteractiveDisplay";
import { EventEmitter } from "../EventEmitter";

export class InteractiveDisplayArea {
  static EVENTS = {
    MOUSE_ENTER: Symbol("MOUSE_ENTER"),
    MOUSE_LEAVE: Symbol("MOUSE_LEAVE"),
    MOUSE_MOVE: Symbol("MOUSE_MOVE"),
    MOUSE_DOWN: Symbol("MOUSE_DOWN"),
    MOUSE_UP: Symbol("MOUSE_UP"),
  };

  constructor({
    x,
    y,
    width,
    height,
    cursorStyle = "default",
    layer = null,
    enable = true,
  }) {
    this.layer = layer;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isActive = enable;
    this.events = new EventEmitter();
    this.cursorStyle = cursorStyle;
    this.focus = null;
    this.clicked = false;
  }

  mouseEnter(x, y) {
    this.events.emit(InteractiveDisplayArea.EVENTS.MOUSE_ENTER, x, y);
    this.focus = [x, y];
  }

  mouseMove(x, y) {
    if (this.focus && this.focus[0] === x && this.focus[1] === y) {
      return;
    }

    if (this.focus) {
      this.focus[0] = x;
      this.focus[1] = y;
    } else {
      this.focus = [x, y];
    }

    this.events.emit(InteractiveDisplayArea.EVENTS.MOUSE_MOVE, x, y);
  }

  mouseLeave(x, y) {
    this.focus = null;
    this.events.emit(InteractiveDisplayArea.EVENTS.MOUSE_LEAVE, x, y);
  }

  mouseDown(x, y) {
    this.clicked = true;
    this.events.emit(InteractiveDisplayArea.EVENTS.MOUSE_DOWN, x, y);
    InteractiveDisplay.events.subscribeOnce(
      InteractiveDisplay.EVENTS.MOUSE_UP,
      (upX, upY) => {
        this.clicked = false;
        this.events.emit(InteractiveDisplayArea.EVENTS.MOUSE_UP, upX, upY);
      }
    );
  }

  check(x, y) {
    if (!this.isActive) {
      return false;
    }
    return (
      x >= this.x &&
      y >= this.y &&
      x <= this.x + this.width &&
      y <= this.y + this.height
    );
  }

  enable() {
    this.isActive = true;
  }

  disable() {
    this.focus = null;
    this.isActive = false;
  }

  destroy() {
    this.events.clear();
  }
}

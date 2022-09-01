import { Stream } from "../Stream";
import { EventEmitter } from "../EventEmitter";

/**
 * Handels
 */
export class InteractiveDisplay {
  constructor({ canvasEl }) {
    this.canvasEl = canvasEl;

    this.layeredAreas = [];
    this.activeLayeredArea = null;

    this.pureAreas = [];
    this.activePureAreas = [];

    this.newPosition = [null, null];
    this.lastPosition = [null, null];

    this.mouseDown = null;
    this.mouseUp = null;

    this.EVENTS = {
      MOUSE_MOVE: Symbol("MOUSE_MOVE"),
      MOUSE_DOWN: Symbol("MOUSE_DOWN"),
      MOUSE_UP: Symbol("MOUSE_UP"),
    };

    this.events = new EventEmitter();

    this.stream = new Stream({
      fn: () => {
        this.update();
      },
      start: false,
    });
  }

  setCursorStyle(style) {
    this.canvasEl.style.cursor = style;
  }

  run() {
    this.canvasEl.addEventListener("mousemove", (e) => {
      this.newPosition[0] = e.offsetX;
      this.newPosition[1] = e.offsetY;
    });

    this.canvasEl.addEventListener("mouseleave", () => {
      this.newPosition[0] = null;
      this.newPosition[1] = null;
    });

    this.canvasEl.addEventListener("mousedown", (e) => {
      this.mouseDown = [e.offsetX, e.offsetY];
    });

    this.canvasEl.addEventListener("mouseup", (e) => {
      e.stopPropagation();
      this.mouseUp = [e.offsetX, e.offsetY];
    });

    window.addEventListener("mouseup", () => {
      this.mouseUp = [null, null];
    });

    this.stream.continue();
  }

  sort() {
    this.layeredAreas = this.layeredAreas.sort((a, b) => b.layer - a.layer);
  }

  update() {
    const newX = this.newPosition[0];
    const newY = this.newPosition[1];

    const cursorStack = [];

    if (this.activePureAreas.length) {
      this.activePureAreas = this.activePureAreas.filter((area) => {
        if (area.check(newX, newY)) {
          area.mouseMove(newX, newY);

          if (
            this.mouseDown &&
            area.check(this.mouseDown[0], this.mouseDown[1])
          ) {
            area.mouseDown(this.mouseDown[0], this.mouseDown[1]);
          }

          cursorStack.push(area.cursorStyle);

          return true;
        }
        area.mouseLeave(newX, newY);
        return false;
      });
    }

    if (this.pureAreas.length) {
      const areas = [...this.pureAreas];
      for (let i = 0; i < areas.length; i++) {
        const area = areas[i];

        if (
          area.check(newX, newY) &&
          this.activePureAreas.indexOf(area) === -1
        ) {
          area.mouseEnter(newX, newY);
          this.activePureAreas.push(area);

          cursorStack.push(area.cursorStyle);
        }
      }
    }

    if (this.activeLayeredArea) {
      if (this.activeLayeredArea.check(newX, newY)) {
        this.activeLayeredArea.mouseMove(newX, newY);

        if (
          this.mouseDown &&
          this.activeLayeredArea.check(this.mouseDown[0], this.mouseDown[1])
        ) {
          this.activeLayeredArea.mouseDown(
            this.mouseDown[0],
            this.mouseDown[1]
          );
        }

        cursorStack.push(this.activeLayeredArea.cursorStyle);
      } else {
        this.activeLayeredArea.mouseLeave(newX, newY);
        this.activeLayeredArea = null;
      }
    }

    if (!this.activeLayeredArea) {
      const areas = [...this.layeredAreas];
      for (let i = 0; i < areas.length; i++) {
        const area = areas[i];

        if (area.check(newX, newY)) {
          area.mouseEnter(newX, newY);
          this.activeLayeredArea = area;
          cursorStack.push(area.cursorStyle);
          break;
        }
      }
    }

    if (cursorStack.length) {
      this.setCursorStyle(cursorStack[cursorStack.length - 1]);
    } else {
      this.setCursorStyle("default");
    }

    if (this.mouseDown) {
      this.events.emit(
        this.EVENTS.MOUSE_DOWN,
        this.mouseDown[0],
        this.mouseDown[1]
      );
      this.mouseDown = null;
    }

    if (this.mouseUp) {
      this.events.emit(this.EVENTS.MOUSE_UP, this.mouseUp[0], this.mouseUp[1]);
      this.mouseUp = null;
    }

    if (newX !== this.lastPosition[0] || newY !== this.lastPosition[1]) {
      this.events.emit(this.EVENTS.MOUSE_MOVE, newX, newY);
    }

    this.lastPosition[0] = newX;
    this.lastPosition[1] = newY;
  }

  addArea(interactiveDisplayArea) {
    if (typeof interactiveDisplayArea.layer !== "number") {
      this.pureAreas.push(interactiveDisplayArea);
    } else {
      this.layeredAreas.push(interactiveDisplayArea);
    }
  }

  deleteArea(interactiveDisplayArea) {
    if (typeof interactiveDisplayArea.layer !== "number") {
      this.pureAreas = this.pureAreas.filter(
        (area) => area !== interactiveDisplayArea
      );
      if (this.activePureAreas.indexOf(interactiveDisplayArea) !== -1) {
        this.activePureAreas = this.activePureAreas.filter(
          (area) => area !== interactiveDisplayArea
        );
      }
    } else {
      this.layeredAreas = this.layeredAreas.filter(
        (area) => area !== interactiveDisplayArea
      );
      if (this.activeLayeredArea === interactiveDisplayArea) {
        this.activeLayeredArea = null;
      }
    }
  }
}

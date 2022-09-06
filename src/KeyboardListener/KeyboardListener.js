import { Stream } from "../Stream";
import { Jobs } from "../Jobs";
import { EventEmitter } from "../EventEmitter";

export class KeyboardListener {
  static EVENTS = {
    KEY_DOWN: Symbol("KEY_DOWN"),
    KEY_UP: Symbol("KEY_UP"),
  };

  constructor() {
    this.stream = new Stream({
      fn: () => this.update(),
      start: false,
    });
    this.destroyingJobs = new Jobs();
    this.queue = [];
    this.pressed = new Map();
    this.events = new EventEmitter();
    this._keyDown = this._keyDown.bind(this);
    this._keyUp = this._keyUp.bind(this);
  }

  _keyDown(event) {
    this.queue.push("down", event.code);
  }

  _keyUp(event) {
    this.queue.push("up", event.code);
  }

  check(keyCode) {
    return this.pressed.get(keyCode) === true;
  }

  subscribeKeyDown(keyCode, fn) {
    return this.events.subscribe(KeyboardListener.EVENTS.KEY_DOWN, (code) => {
      if (code === keyCode) {
        fn(keyCode);
      }
    });
  }

  subscribeKeyUp(keyCode, fn) {
    return this.events.subscribe(KeyboardListener.EVENTS.KEY_UP, (code) => {
      if (code === keyCode) {
        fn(keyCode);
      }
    });
  }

  subscribeAny(keyCode, fn) {
    const unsubscribeDown = this.events.subscribe(
      KeyboardListener.EVENTS.KEY_DOWN,
      (code) => {
        if (code === keyCode) {
          fn(keyCode);
        }
      }
    );

    const unsubscribeUp = this.events.subscribe(
      KeyboardListener.EVENTS.KEY_UP,
      (code) => {
        if (code === keyCode) {
          fn(keyCode);
        }
      }
    );

    return () => {
      unsubscribeDown();
      unsubscribeUp();
    };
  }

  run() {
    document.addEventListener("keydown", this._keyDown);
    document.addEventListener("keyup", this._keyUp);

    this.destroyingJobs.add([
      () => document.removeEventListener("keydown", this._keyDown),
      () => document.removeEventListener("keyup", this._keyUp),
    ]);

    this.stream.continue();
  }

  destroy() {
    this.destroyingJobs.run();
  }

  update() {
    if (!this.queue.length) {
      return;
    }
    const type = this.queue.shift();
    const code = this.queue.shift();

    if (type === "down") {
      this.pressed.set(code, true);
      this.events.emit(KeyboardListener.EVENTS.KEY_DOWN, code);
    } else {
      this.pressed.delete(code);
      this.events.emit(KeyboardListener.EVENTS.KEY_UP, code);
    }
  }
}

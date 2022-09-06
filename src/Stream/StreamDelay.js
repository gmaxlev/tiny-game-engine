import { Stream } from "./Stream";
import { Game } from "../Game";

export class StreamDelay extends Stream {
  constructor({ fn, start = true, delay = 0 }) {
    super({
      fn: () => this.update(),
      start,
    });
    this.callback = fn;
    this.delay = delay;
    this.time = 0;
  }

  reset() {
    this.time = 0;
  }

  update() {
    if (this.time >= this.delay) {
      this.callback();
      this.time = 0;
      this.stop();
      return;
    }
    this.time += Game.dt;
  }
}

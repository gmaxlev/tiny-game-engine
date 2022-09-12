import { Stream } from "./Stream";
import { Game } from "../Game";

export class StreamDelay extends Stream {
  constructor({ fn = null, start = true, name = null, delay = 0 }) {
    super({
      fn: () => this.update(),
      start,
      name,
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

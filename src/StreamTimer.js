import { Stream } from "./Stream";
import { Game } from "./Game";

export class StreamTimer extends Stream {
  constructor({ start = true, time, callback }) {
    super({
      start,
      fn: () => {
        this.delay();
      },
    });
    this._time = time;
    this._callback = callback;
    this._timer = 0;
  }

  delay() {
    if (this._timer >= this._time) {
      this._callback(this._timer);
      this._timer = 0;
      this.stop();
      return;
    }

    this._timer += Game.dt;
  }
}

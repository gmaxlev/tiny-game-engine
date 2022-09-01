import { Stream } from "./Stream";
import { Game } from "./Game";
import { EventEmitter } from "./EventEmitter";

export class KeyFrames {
  static EVENTS = {
    START: Symbol("START"),
    RESTART: Symbol("RESTART"),
    STOP: Symbol("STOP"),
    PAUSE: Symbol("PAUSE"),
  };

  constructor({
    fn,
    total,
    loop = false,
    exact = false,
    start = false,
    times = 1,
    pingPong = false,
    interceptor = null,
  }) {
    this.events = new EventEmitter();
    this.update = this.update.bind(this);
    this.stream = new Stream({ fn: this.update, start });
    this.total = total;
    this.time = 0;
    this.current = 0;
    this.progress = 0;
    this.loop = loop;
    this.exact = exact;
    this.fn = fn;
    this.totalTimes = times;
    this.times = 0;
    this.pingPong = pingPong;
    this.direction = true;
    this.isStopped = !start;
    this.isActive = start;
    this.interceptor = interceptor;
  }

  formatTime(time) {
    return this.exact ? Math.max(0, Math.min(time, this.total)) : time;
  }

  update() {
    if (this.fn) {
      this.fn({
        time: this.time,
        total: this.total,
      });
    }

    if (
      (this.direction && this.current >= this.total) ||
      (!this.direction && this.current <= 0)
    ) {
      this.times += 1;

      if (this.pingPong) {
        this.direction = !this.direction;
      }

      if (this.loop || this.times < this.totalTimes) {
        if (!this.pingPong) {
          this._updateTime(0);
        }
      } else {
        this.pause();
      }
      if (!this.pingPong) {
        return;
      }
    }

    if (this.pingPong) {
      this._updateTime(
        this.direction ? this.current + Game.dt : this.current - Game.dt
      );
    } else {
      this._updateTime(this.current + Game.dt);
    }
  }

  stop() {
    this.isStopped = true;
    this.isActive = false;
    this.direction = true;
    this.times = 0;
    this._updateTime(0);
    this.stream.stop();
    this.events.emit(KeyFrames.EVENTS.STOP);
  }

  pause() {
    if (!this.isStopped) {
      this.isActive = false;
      this.isStopped = true;
      this.stream.stop();
      this.events.emit(KeyFrames.EVENTS.PAUSE);
    }
  }

  start() {
    if (!this.isActive) {
      this.isStopped = false;
      this.isActive = true;
      this.stream.continue();
      this.events.emit(KeyFrames.EVENTS.START);
    }
  }

  restart() {
    this.isStopped = false;
    this.isActive = true;
    this.direction = true;
    this.times = 0;
    this._updateTime(0);
    this.stream.continue();
    this.events.emit(KeyFrames.EVENTS.RESTART);
  }

  destroy() {
    this.stream.destroy();
  }

  _updateTime(time) {
    this.current = this.formatTime(time);
    this.progress = this.interceptor
      ? this.interceptor(this.current / this.total)
      : this.current / this.total;
    this.time = this.progress * this.total;
  }
}

import { Stream } from "../Stream";
import { Jobs } from "../Jobs";

export class Game {
  static dt = 0;

  static time = null;

  static stream = new Stream({ start: true, name: "Root" });

  static jobs = {
    beforeUpdate: new Jobs(),
    afterUpdate: new Jobs(),
  };

  constructor({ update, canvas }) {
    this.update = update;
    Game.time = 0;
    this.canvas = canvas;
    this.frame = this.frame.bind(this);
  }

  frame() {
    requestAnimationFrame(this.frame);

    const frames = Game.dt / 60;
    const count = Math.ceil(frames);
    const rest = count - frames;

    for (let i = 1; i <= count; i++) {
      Game.dt = rest !== 0 && i === count ? 60 - rest * 60 : 60;
      Stream.processing = true;
      Game.stream.call();
      Stream.processing = false;
      Stream.queue.call();
    }

    Game.dt = Math.min(Date.now() - Game.time, 100);
    Game.jobs.beforeUpdate.run();
    this.update();
    Game.jobs.afterUpdate.run();
    Game.time = Date.now();
  }

  run() {
    document.body.append(this.canvas);
    Game.stream.continue();
    Game.time = Date.now();
    this.frame();
  }
}

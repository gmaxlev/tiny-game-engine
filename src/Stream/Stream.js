import { StreamsQueue } from "./StreamsQueue";

class Stream {
  static processing = false;

  static queue = new StreamsQueue();

  constructor({ fn = null, start = true } = { fn: null, start: true }) {
    this.fn = fn;
    this.children = [];
    this.parent = null;
    this.isActive = start;
    this.isDeleted = false;
    this.isExecuting = false;
  }

  child(stream) {
    if (Array.isArray(stream)) {
      stream.forEach((item) => {
        this.child(item);
      });
      return;
    }

    stream.parent = this;
    if (Stream.processing) {
      Stream.queue.child(stream);
      return;
    }
    this.children.push(stream);
    return stream;
  }

  call() {
    if (!this.isActive || this.isDeleted) {
      return;
    }

    this.isExecuting = true;

    if (this.fn) {
      this.fn();
    }

    if (!this.isActive || this.isDeleted) {
      this.isExecuting = false;
      return;
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].call();
    }
    this.isExecuting = false;
  }

  destroyChild(stream) {
    stream.isDeleted = true;
    if (Stream.processing) {
      Stream.queue.destroy(stream);
      return;
    }
    this.children = this.children.filter((item) => item !== stream);
  }

  destroy() {
    if (!this.parent) {
      return;
    }
    this.parent.destroyChild(this);
  }

  stop() {
    this.isActive = false;
  }

  continue() {
    this.isActive = true;
  }
}

export { Stream };

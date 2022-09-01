export class StreamsQueue {
  constructor() {
    this.queue = [];
  }

  child(stream) {
    this.queue = this.queue.filter((item) => item.stream !== stream);
    this.queue.push({
      type: "child",
      stream,
    });
  }

  destroy(stream) {
    this.queue = this.queue.filter((item) => item.stream !== stream);
    this.queue.push({
      type: "destroy",
      stream,
    });
  }

  call() {
    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];
      if (item.type === "destroy") {
        item.stream.destroy();
      } else if (item.type === "child") {
        item.stream.parent.child(item.stream);
      }
    }
    this.queue = [];
  }
}

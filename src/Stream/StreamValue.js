import { Stream } from "./Stream";

export class StreamValue extends Stream {
  constructor({ fn, start, initialValue }) {
    super({
      fn: () => {
        this.value = fn(this.value);
      },
      start,
    });
    this.value = initialValue;
  }

  setValue(value) {
    this.value = value;
  }
}

import { Stream } from "./Stream";

export class StreamValue extends Stream {
  constructor({ fn, start, initialValue, name = null }) {
    super({
      fn: () => {
        this.value = fn(this.value);
      },
      start,
      name,
    });
    this.value = initialValue;
  }

  setValue(value) {
    this.value = value;
  }
}

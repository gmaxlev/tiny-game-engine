import { Stream } from "./Stream";

export class StreamValue extends Stream {
  constructor({ fn = null, start = true, name = null, initialValue }) {
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

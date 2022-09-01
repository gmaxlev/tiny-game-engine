import { EventEmitter } from "../EventEmitter";

class ResourceLoader {
  static EVENTS = {
    LOAD_ERROR_EVENT: Symbol("LOAD_ERROR_EVENT"),
    LOAD_EVENT: Symbol("LOAD_EVENT"),
  };

  constructor() {
    this.events = new EventEmitter();
  }

  load() {}

  get() {}
}

export { ResourceLoader };

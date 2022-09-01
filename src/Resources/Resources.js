import { Resource } from "./Resource";
import { EventEmitter } from "../EventEmitter";

class Resources {
  static EVENTS = {
    LOAD_PROGRESS_EVENT: Symbol("LOAD_PROGRESS_EVENT"),
    LOAD_ERROR_EVENT: Symbol("LOAD_ERROR_EVENT"),
    LOAD_EVENT: Symbol("LOAD_ERROR_EVENT"),
  };

  constructor() {
    this.map = new Map();
    this.loadings = 0;
    this.errors = [];
    this.loaded = false;
    this.loadingProgress = 0;
    this.events = new EventEmitter();
  }

  add(keyOrObject, resource) {
    if (typeof keyOrObject === "object" && !resource) {
      for (const key in keyOrObject) {
        this.add(key, keyOrObject[key]);
      }
      return;
    }
    if (this.map.has(keyOrObject)) {
      throw new Error(
        `A resource with the key ${keyOrObject} have already existed`
      );
    }
    this.map.set(keyOrObject, resource);
  }

  addMap(map) {
    for (const key in map) {
      this.add(key, map[key]);
    }
  }

  load() {
    if (this.loadings) {
      return;
    }
    this.errors = [];
    this.loadingProgress = 0;

    this.map.forEach((resource) => {
      if (!resource.loaded) {
        this.loadings += 1;
        resource.events.subscribe(Resource.EVENTS.LOAD_EVENT, () => {
          this.loadings -= 1;
          this._checkForCompleteLoading();
        });

        resource.events.subscribe(Resource.EVENTS.LOAD_PROGRESS_EVENT, () => {
          this._updateProgress();
        });

        resource.events.subscribe(Resource.EVENTS.LOAD_ERROR_EVENT, (e) => {
          this.loadings -= 1;
          this.errors.push(e);
        });
        resource.load();
      }
    });
  }

  get(key) {
    return this.map.get(key).get();
  }

  _updateProgress() {
    let total = 0;
    this.map.forEach((resource) => {
      total += resource.loadingProgress;
    });
    this.loadingProgress = total / this.map.size;
    this.events.emit(
      Resources.EVENTS.LOAD_PROGRESS_EVENT,
      this.loadingProgress
    );
  }

  _checkForCompleteLoading() {
    if (this.loadings) {
      return;
    }
    if (!this.errors.length) {
      this.loaded = true;
      this.events.emit(Resources.EVENTS.LOAD_EVENT, this);
    } else {
      this.events.emit(Resources.EVENTS.LOAD_ERROR_EVENT, this.errors);
    }
  }
}

export { Resources };

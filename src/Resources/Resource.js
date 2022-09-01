import { EventEmitter } from "../EventEmitter";
import { ImageResourceLoader } from "./ImageResourceLoader";
import { ResourceLoader } from "./ResourceLoader";
import { FontResourceLoader } from "./FontResourceLoader";

class Resource {
  static EVENTS = {
    LOAD_PROGRESS_EVENT: Symbol("LOAD_PROGRESS_EVENT"),
    LOAD_ERROR_EVENT: Symbol("LOAD_ERROR_EVENT"),
    LOAD_EVENT: Symbol("LOAD_EVENT"),
  };

  constructor(path, payload) {
    this.path = path;
    this.isLoading = false;
    this.isError = false;
    this.events = new EventEmitter();
    this.resource = null;
    this.loadingProgress = 0;
    this.loaded = false;
    this.payload = payload;
  }

  load() {
    if (this.isLoading || this.loaded) {
      return;
    }
    this.isLoading = true;
    this.isError = false;
    this.loadingProgress = 0;

    try {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          this.loadingProgress = event.loaded / event.total;
          this.events.emit(
            Resource.EVENTS.LOAD_PROGRESS_EVENT,
            this.loadingProgress
          );
        }
      });

      xhr.addEventListener("loadend", (e) => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          this._resolve(xhr.response.type, xhr.response);
        } else {
          this.isError = true;
          this.events.emit(Resource.EVENTS.LOAD_ERROR_EVENT, e);
        }
        this.isLoading = false;
      });

      xhr.responseType = "blob";

      xhr.open("GET", this.path, true);

      xhr.send();
    } catch (error) {
      this.isError = true;
      this.events.emit(Resource.EVENTS.LOAD_ERROR_EVENT, error);
    }
  }

  get() {
    if (!this.resource) {
      throw new Error("The resource is not loaded yet");
    }
    return this.resource.get();
  }

  destroy() {
    if (this.resource && this.resource.destroy) {
      this.resource.destroy();
    }
    this.events.clear();
  }

  _resolve(mime, content) {
    if (!Object.keys(Resource.resolvers).find((ext) => ext === mime)) {
      throw new Error(`Mime ${mime} is not supported`);
    }
    this.resource = new Resource.resolvers[mime](mime, content, this.payload);
    this.resource.events.subscribe(ResourceLoader.EVENTS.LOAD_EVENT, () => {
      this.events.emit(Resource.EVENTS.LOAD_EVENT, this.get());
      this.loaded = true;
    });
    this.resource.events.subscribe(
      ResourceLoader.EVENTS.LOAD_ERROR_EVENT,
      (e) => {
        this.isError = true;
        this.events.emit(Resource.EVENTS.LOAD_ERROR_EVENT, e);
      }
    );
    this.resource.load();
  }
}

Resource.resolvers = {
  "image/jpeg": ImageResourceLoader,
  "image/webp": ImageResourceLoader,
  "image/png": ImageResourceLoader,
  "font/ttf": FontResourceLoader,
};

export { Resource };

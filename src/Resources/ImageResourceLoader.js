import { ResourceLoader } from "./ResourceLoader";

class ImageResourceLoader extends ResourceLoader {
  constructor(mime, blob) {
    super();
    this._blob = blob;
    this.el = new Image();
    this.el.addEventListener("load", () => {
      this.events.emit(ResourceLoader.EVENTS.LOAD_EVENT, this.el);
    });
    this.el.addEventListener("error", (e) => {
      this.events.emit(ResourceLoader.EVENTS.LOAD_ERROR_EVENT, e);
    });
  }

  load() {
    this.el.src = window.URL.createObjectURL(this._blob);
  }

  get() {
    return this.el;
  }
}

export { ImageResourceLoader };

import { ResourceLoader } from "./ResourceLoader";

class FontResourceLoader extends ResourceLoader {
  constructor(mime, blob, config) {
    super();
    this.blob = blob;
    this.font = null;
    this.config = config;
  }

  load() {
    this.blob
      .arrayBuffer()
      .then((result) => {
        this.font = new FontFace(this.config.fontName, result);
        this.font.weight = this.config.fontWeight
          ? this.config.fontWeight
          : "400";
        document.fonts.add(this.font);
        this.events.emit(ResourceLoader.EVENTS.LOAD_EVENT, this.font);
      })
      .catch((error) => {
        this.events.emit(ResourceLoader.EVENTS.LOAD_ERROR_EVENT, error);
      });
  }

  get() {
    return null;
  }
}

export { FontResourceLoader };

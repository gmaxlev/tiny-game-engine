import { Resource } from './Resource.ts'

interface FontResourceConfig {
  fontName: string
  fontWeight?: string
}

export class FontResource extends Resource<FontFace> {
  fontConfig: FontResourceConfig

  constructor (path: string, config: FontResourceConfig) {
    super(path)
    this.fontConfig = config
  }

  resolve (type: string, blob: Blob): void {
    blob
      .arrayBuffer()
      .then((result) => {
        this._setResource(new FontFace(this.fontConfig.fontName, result))

        const resource = this.getResourceOrThrow()

        resource.weight = (this.fontConfig.fontWeight != null)
          ? this.fontConfig.fontWeight
          : '400'

        document.fonts.add(resource)

        this.events.emit(Resource.EVENT_LOAD, resource)
      })
      .catch((error) => {
        this.events.emit(Resource.EVENT_LOAD_ERROR, error)
      })
  }
}

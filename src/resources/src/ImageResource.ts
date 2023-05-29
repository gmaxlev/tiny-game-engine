import { Resource } from './Resource.ts'

export class ImageResource extends Resource<HTMLImageElement> {
  resolve (type: string, blob: Blob): void {
    this._setResource(new Image())

    const resource = this.getResourceOrThrow()

    resource.addEventListener('load', () => {
      this.events.emit(Resource.EVENT_LOAD, resource)
    })
    resource.addEventListener('error', (e) => {
      this.events.emit(Resource.EVENT_LOAD_ERROR, new Error(e.message))
    })
    resource.src = window.URL.createObjectURL(blob)
  }
}

import { EventEmitter } from '../../core/src/EventEmitter.ts'

export abstract class Resource<T> {
  static readonly EVENT_PROGRESS: unique symbol = Symbol('EVENT_PROGRESS')

  static readonly EVENT_LOAD_ERROR: unique symbol = Symbol('EVENT_LOAD_ERROR')

  static readonly EVENT_LOAD: unique symbol = Symbol('EVENT_LOAD')

  readonly events: EventEmitter<{
    [Resource.EVENT_PROGRESS]: (progress: number) => void
    [Resource.EVENT_LOAD_ERROR]: (error: Error) => void
    [Resource.EVENT_LOAD]: (data: T) => void
  }>

  readonly #path: string

  #isLoading: boolean

  #loadingProgress: number

  #error: null | Error

  #resource: null | T

  constructor (path: string) {
    this.events = new EventEmitter()
    this.#path = path
    this.#isLoading = false
    this.#loadingProgress = 0
    this.#error = null
    this.#resource = null
  }

  /**
   * Must emit {@link Resource#EVENT_LOAD} event
   * @param type
   * @param blob
   */
  abstract resolve (type: string, blob: Blob): void

  getResourceOrThrow (): T {
    const resource = this.#resource

    if (resource === null) {
      throw new Error('Resource has not been loaded yet')
    }

    return resource as T
  }

  getResource (): T | null {
    return this.#resource
  }

  getLoadingProgress (): number {
    return this.#loadingProgress
  }

  isLoading (): boolean {
    return this.#isLoading
  }

  get (): T | null {
    return this.#resource
  }

  load (): void {
    if (this.#isLoading) {
      return
    }
    this.#isLoading = true
    this.#error = null
    this.#loadingProgress = 0

    try {
      const xhr = new XMLHttpRequest()

      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          this.#loadingProgress = event.loaded / event.total
          this.events.emit(Resource.EVENT_PROGRESS, this.#loadingProgress)
        }
      })

      xhr.addEventListener('loadend', (e) => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          if (this.#loadingProgress !== 1) {
            this.#loadingProgress = 1
            this.events.emit(Resource.EVENT_PROGRESS, 1)
          }
          this.resolve(xhr.response.type, xhr.response)
        } else {
          this.#error = new Error('Resource loading error')
          this.events.emit(Resource.EVENT_LOAD_ERROR, this.#error)
        }
        this.#isLoading = false
      })

      xhr.responseType = 'blob'

      xhr.open('GET', this.#path, true)

      xhr.send()
    } catch (error) {
      if (error instanceof Error) {
        this.#error = error
      } else {
        this.#error = new Error('Resource loading error')
      }

      this.events.emit(Resource.EVENT_LOAD_ERROR, this.#error)
    }
  }

  _setResource (value: T): void {
    this.#resource = value
  }
}

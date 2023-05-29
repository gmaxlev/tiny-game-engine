import { Resource } from './Resource.ts'
import { EventEmitter } from '../../core'

export class Resources<
  M extends Record<PropertyKey, R>,
  R extends Resource<unknown> = Resource<unknown>
> {
  static readonly EVENT_PROGRESS: unique symbol = Symbol('EVENT_PROGRESS')

  static readonly EVENT_LOAD_ERROR: unique symbol = Symbol('EVENT_LOAD_ERROR')

  static readonly EVENT_LOAD: unique symbol = Symbol('EVENT_LOAD')

  events: EventEmitter<{
    [Resources.EVENT_PROGRESS]: (progress: number) => void
    [Resources.EVENT_LOAD_ERROR]: (errors: Error[]) => void
    [Resources.EVENT_LOAD]: (resources: Resources<M>) => void
  }>

  #map: Map<keyof M, M[keyof M]>

  #loadings: number

  #errors: Error[]

  #loaded: boolean

  #loadingProgress: number

  constructor () {
    this.events = new EventEmitter()
    this.#map = new Map()
    this.#loadings = 0
    this.#errors = []
    this.#loaded = false
    this.#loadingProgress = 0
  }

  getLoadingProgress (): number {
    return this.#loadingProgress
  }

  add<K extends keyof M>(keyOrObject: K | Record<K, M[K]>, resource?: M[K]): void {
    if (typeof keyOrObject === 'object') {
      for (const key in keyOrObject) {
        this.add(key, keyOrObject[key] as M[K])
      }
      return
    }

    if (this.#map.has(keyOrObject)) {
      throw new Error(
        `A resource with the key ${String(keyOrObject)} have already existed`
      )
    }
    if (resource != null) {
      this.#map.set(keyOrObject, resource)
    }
  }

  get<K extends keyof M>(eventName: K): M[K] | undefined {
    return this.#map.get(eventName) as M[K] | undefined
  }

  load (): void {
    if (this.#loadings !== 0) {
      return
    }
    this.#errors = []
    this.#loadingProgress = 0

    this.#map.forEach((resource) => {
      if (resource.getResource() === null && !resource.isLoading()) {
        this.#loadings += 1
        resource.events.on(Resource.EVENT_LOAD, () => {
          this.#loadings -= 1
          this.#checkForCompleteLoading()
        })

        resource.events.on(Resource.EVENT_PROGRESS, () => {
          this.#updateProgress()
        })

        resource.events.on(Resource.EVENT_LOAD_ERROR, (e) => {
          this.#loadings -= 1
          this.#errors.push(e)
        })
        resource.load()
      }
    })
  }

  #updateProgress (): void {
    let total = 0
    this.#map.forEach((resource) => {
      total += resource.getLoadingProgress()
    })
    this.#loadingProgress = total / this.#map.size
    this.events.emit(Resources.EVENT_PROGRESS, this.#loadingProgress)
  }

  #checkForCompleteLoading (): void {
    if (this.#loadings !== 0) {
      return
    }
    if (this.#errors.length === 0) {
      this.#loaded = true
      this.events.emit(Resources.EVENT_LOAD, this)
    } else {
      this.events.emit(Resources.EVENT_LOAD_ERROR, this.#errors)
    }
  }
}

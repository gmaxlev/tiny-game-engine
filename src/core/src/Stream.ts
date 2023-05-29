import { Jobs } from './Jobs.ts'

export type StreamFn = (dt: number, stream: Stream) => void

export interface StreamOptions {
  fn?: StreamFn | null
  start?: boolean
  name?: string | null
}

export class Stream {
  static processing = 0

  static update = new Jobs()

  fn: StreamFn | null

  children: Stream[]

  parent: Stream | null

  isActive: boolean

  isDeleted: boolean

  isExecuting: boolean

  name: string | null

  constructor ({
    fn = null,
    start = true,
    name = null
  }: StreamOptions = {}) {
    this.fn = fn
    this.children = []
    this.parent = null
    this.isActive = start
    this.isDeleted = false
    this.isExecuting = false
    this.name = name
  }

  child (stream: Stream | Stream[]): Stream[] {
    const normalized = Array.isArray(stream) ? stream : [stream]

    normalized.forEach((item) => {
      item.parent = this
    })

    if (Stream.processing !== 0) {
      Stream.update.add(() => this.child(normalized))
      return normalized
    }

    this.children.push(...normalized)

    return normalized
  }

  call (dt: number): void {
    if (!this.isActive || this.isDeleted) {
      return
    }

    Stream.processing += 1

    this.isExecuting = true

    if (this.fn != null) {
      this.fn(dt, this)
    }

    if (!this.isActive || this.isDeleted) {
      Stream.processing -= 1
      this.isExecuting = false
      return
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].call(dt)
    }

    Stream.processing -= 1

    this.isExecuting = false
  }

  destroy (): void {
    if (this.parent == null) {
      return
    }

    this.isDeleted = true

    if (Stream.processing !== 0) {
      Stream.update.add(() => { this.destroy() })
      return
    }

    this.parent.children = this.parent.children.filter((item) => item !== this)
  }

  stop (): void {
    this.isActive = false
  }

  start (): void {
    this.isActive = true
  }
}

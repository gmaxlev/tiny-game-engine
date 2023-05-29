import { noop } from '../../utils.ts'
import { GarbageCollector, EventEmitter } from '../../core'
import { Ticker } from '../../core/src/Ticker.ts'
export abstract class GameObject {
  static readonly DEFAULT_MARK_FOR_UPDATE = Symbol('DEFAULT_MARK_FOR_UPDATE')

  static readonly EVENT_MARK_FOR_UPDATE: unique symbol = Symbol(
    'EVENT_MARK_FOR_UPDATE'
  )

  static readonly EVENT_UNMARK_FOR_UPDATE: unique symbol = Symbol(
    'EVENT_UNMARK_FOR_UPDATE'
  )

  readonly _internalEvents: EventEmitter<{
    [GameObject.EVENT_MARK_FOR_UPDATE]: (frames: number) => void
    [GameObject.EVENT_UNMARK_FOR_UPDATE]: (frames: number) => void
  } >

  private readonly _marksForUpdate: {
    self: Map<unknown, number>
    subscriptions: number
  }

  private _lastUpdate: number | null

  private readonly _subscribers: Map<
  GameObject,
  {
    unsubscribes: Array<() => void>
  }
  >

  protected _destroyed: boolean

  readonly garbage = new GarbageCollector()

  protected constructor () {
    this._internalEvents = new EventEmitter()

    this._marksForUpdate = {
      self: new Map(),
      subscriptions: 0
    }

    this._lastUpdate = null

    this._subscribers = new Map()

    this._destroyed = false
  }

  subscribe (gameObject: GameObject): (() => void) {
    if (this._destroyed || gameObject._destroyed) {
      return noop
    }

    const unsubscribes = []

    unsubscribes.push(
      this._internalEvents.on(GameObject.EVENT_MARK_FOR_UPDATE, (marks) => {
        gameObject._addSubscribedMark(marks)
      }),
      this._internalEvents.on(GameObject.EVENT_UNMARK_FOR_UPDATE, (marks) => {
        gameObject._removeSubscribedMark(marks)
      })
    )

    const existingMarks =
            this._marksForUpdate.self.size + this._marksForUpdate.subscriptions

    if (existingMarks > 0) {
      gameObject._addSubscribedMark(existingMarks)
    }

    this._subscribers.set(gameObject, { unsubscribes })

    return () => {
      this.unsubscribe(gameObject)
    }
  }

  unsubscribe (gameObject: GameObject): void {
    if (this._destroyed) {
      return
    }

    if (this._subscribers.has(gameObject)) {
      const existingMarks =
                this._marksForUpdate.self.size + this._marksForUpdate.subscriptions

      if (existingMarks > 0) {
        gameObject._removeSubscribedMark(existingMarks)
      }

      this._subscribers.get(gameObject)?.unsubscribes.forEach((fn) => { fn() })
      this._subscribers.delete(gameObject)
    }
  }

  markForUpdate (mark: unknown = GameObject.DEFAULT_MARK_FOR_UPDATE, frames = Infinity): void {
    if (this._destroyed) {
      return
    }

    if (!this._marksForUpdate.self.has(mark)) {
      this._marksForUpdate.self.set(mark, frames)
      this._internalEvents.emit(GameObject.EVENT_MARK_FOR_UPDATE, 1)
    }
  }

  unmarkForUpdate (mark: unknown = GameObject.DEFAULT_MARK_FOR_UPDATE): void {
    if (this._destroyed) {
      return
    }

    if (this._marksForUpdate.self.has(mark)) {
      this._marksForUpdate.self.delete(mark)
      this._internalEvents.emit(GameObject.EVENT_UNMARK_FOR_UPDATE, 1)
    }
  }

  clearMarksForUpdate (): void {
    if (this._destroyed) {
      return
    }

    const size = this._marksForUpdate.self.size
    if (this._marksForUpdate.self.size > 0) {
      this._marksForUpdate.self.clear()
      this._internalEvents.emit(GameObject.EVENT_UNMARK_FOR_UPDATE, size)
    }
  }

  _shouldUpdate (): boolean {
    if (this._destroyed || this._lastUpdate === Ticker.TIME) {
      return false
    }

    if (
      this._marksForUpdate.self.size === 0 &&
            this._marksForUpdate.subscriptions === 0
    ) {
      return false
    }

    return true
  }

  _tick (): void {
    let deletingMarks = 0

    this._marksForUpdate.self.forEach((value, key, map) => {
      if (value - 1 === 0) {
        map.delete(key)
        deletingMarks += 1
      } else {
        map.set(key, value - 1)
      }
    })

    if (deletingMarks > 0) {
      this._internalEvents.emit(GameObject.EVENT_UNMARK_FOR_UPDATE, deletingMarks)
    }

    this._lastUpdate = Ticker.TIME
  }

  destroy (): void {
    if (this._destroyed) {
      return
    }

    this._internalEvents.emit(
      GameObject.EVENT_UNMARK_FOR_UPDATE,
      this._marksForUpdate.self.size
    )
    this._marksForUpdate.self.clear()
    this._internalEvents.clear()
    this.garbage.run()
    this._destroyed = true
  }

  _addSubscribedMark (marks: number): void {
    if (this._destroyed) {
      return
    }
    this._marksForUpdate.subscriptions += marks
    this._internalEvents.emit(GameObject.EVENT_MARK_FOR_UPDATE, marks)
  }

  _removeSubscribedMark (marks: number): void {
    if (this._destroyed) {
      return
    }
    this._marksForUpdate.subscriptions -= marks
    this._internalEvents.emit(GameObject.EVENT_UNMARK_FOR_UPDATE, marks)
  }
}

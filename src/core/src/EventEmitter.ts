 type EventStore = Record<string, (...args: any[]) => void>

type EventParameters<
    Events extends EventStore,
    Event extends keyof Events
> = Parameters<Events[Event]>

type UnsubscribeFn = () => void

export class EventEmitter<
    Events extends EventStore,
    EventKeys extends keyof Events = keyof Events
> {
  listeners = new Map<EventKeys, Array<(...args: any[]) => any>>()

  emit<K extends EventKeys>(
    key: K,
    ...args: EventParameters<Events, K>
  ): number {
    const listeners = this.listeners.get(key)

    if (listeners == null) {
      return 0
    }

    listeners.forEach((listener) => listener(...args))

    return listeners.length
  }

  on<K extends EventKeys>(
    key: K,
    listener: (...args: EventParameters<Events, K>) => void
  ): UnsubscribeFn {
    const listeners = this.listeners.get(key)
    const normalized = listeners == null ? [] : listeners
    normalized.push(listener)
    this.listeners.set(key, normalized)

    return () => { this.off(key, listener) }
  }

  once<K extends EventKeys>(
    key: K,
    listener: (...args: EventParameters<Events, K>) => void
  ): UnsubscribeFn {
    const off = this.on(key, (...args) => {
      off()
      listener(...args)
    })
    return off
  }

  off<K extends EventKeys>(
    key: K,
    listener: (...args: EventParameters<Events, K>) => void
  ): void {
    const listeners = this.listeners.get(key)

    if (listeners == null) {
      return
    }

    const update = listeners.filter((l) => l !== listener)

    if (update.length > 0) {
      this.listeners.set(key, update)
    } else {
      this.listeners.delete(key)
    }
  }

  clear (): void {
    this.listeners.clear()
  }
}

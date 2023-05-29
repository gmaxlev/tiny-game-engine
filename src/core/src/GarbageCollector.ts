interface Destroyable {
  destroy: () => unknown
}

interface Clearable {
  clear: () => unknown
}

type Garbage = Destroyable | Clearable | ((...args: any[]) => unknown)

export class GarbageCollector {
  private readonly garbage = new Set<Garbage>()

  add (...garbage: Garbage[]): () => void {
    garbage.forEach((garbage) => {
      this.garbage.add(garbage)
    })

    return () => {
      this.remove(...garbage)
    }
  }

  remove (...garbage: Garbage[]): void {
    garbage.forEach((garbage) => {
      this.garbage.delete(garbage)
    })
  }

  run (): void {
    this.garbage.forEach((garbage) => {
      if (typeof garbage === 'function') {
        garbage()
      } else if ('destroy' in garbage && typeof garbage.destroy === 'function') {
        garbage.destroy()
      } else if ('off' in garbage && typeof garbage.off === 'function') {
        garbage.off()
      }
    })

    this.garbage.clear()
  }
}

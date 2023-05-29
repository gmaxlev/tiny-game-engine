export type TickerUpdate = (dt: number) => void

interface TickerOptions {
  update: TickerUpdate
}

export class Ticker {
  private readonly update: TickerUpdate
  static TIME: number = 0
  private dt: number = 0

  constructor ({ update }: TickerOptions) {
    this.update = update
    this.dt = 0
    this.tick = this.tick.bind(this)
  }

  private tick (): void {
    requestAnimationFrame(this.tick)

    let rest = this.dt

    do {
      const dt = Math.min(rest / 60, 1) * 60
      this.update(dt)
      rest -= 60
    } while (rest > 0)

    this.dt = Math.min(Date.now() - Ticker.TIME, 60)

    Ticker.TIME = Date.now()
  }

  run (): void {
    Ticker.TIME = Date.now()
    this.tick()
  }
}

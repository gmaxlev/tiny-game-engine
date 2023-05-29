import { Ticker, type TickerUpdate } from './Ticker.ts'
import { Stream } from './Stream.ts'
import { Jobs } from './Jobs.ts'

interface GameOptions {
  update: TickerUpdate
}

export class Game {
  private readonly ticker: Ticker

  readonly stream = new Stream({
    name: 'Game'
  })

  private readonly update: TickerUpdate

  readonly nextTickJobs = new Jobs()

  constructor ({ update }: GameOptions) {
    this.update = update
    this.ticker = new Ticker({ update: this.tick })
  }

  tick = (dt: number): void => {
    this.nextTickJobs.run()
    this.stream.call(dt)
    this.update(dt)
    Stream.update.run()
  }

  run (): void {
    this.ticker.run()
  }
}

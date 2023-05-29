import { GameObject } from './GameObject.ts'
export interface GameObjectCanvasOptions {
  width?: number
  height?: number
}

export abstract class GameObjectCanvas extends GameObject {
  size: {
    width: number
    height: number
  }

  canvas: HTMLCanvasElement

  ctx: CanvasRenderingContext2D

  protected constructor ({ width = 300, height = 300 }: GameObjectCanvasOptions = {}) {
    super()
    this.size = { width, height }
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
  }

  abstract render (): void

  _clear (): void {
    if (this._destroyed) {
      return
    }

    this.ctx.clearRect(0, 0, this.size.width, this.size.height)
  }

  draw (entity: GameObjectCanvas, x = 0, y = 0): void {
    if (this._destroyed) {
      return
    }

    if (entity instanceof GameObjectCanvas) {
      if (entity._shouldUpdate()) {
        entity._clear()
        entity.render()
        entity._tick()
      }
      this.ctx.drawImage(entity.canvas, x, y)
    }
    // else if (entity instanceof GameObjectPure) {
    //   if (entity.update()) {
    //     entity.render(this.ctx, x, y)
    //   }
    // }
  }

  destroy (): void {
    super.destroy()
  }
}

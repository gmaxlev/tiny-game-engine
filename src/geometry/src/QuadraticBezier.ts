import { Vector2 } from './Vector2.ts'
import { quadraticBezier } from '../../math'
export class QuadraticBezier {
  private readonly v0: Vector2
  private readonly v1: Vector2
  private readonly v2: Vector2

  private readonly vector: Vector2 = new Vector2()

  constructor (v0: Vector2, v1: Vector2, v2: Vector2) {
    this.v0 = v0
    this.v1 = v1
    this.v2 = v2
  }

  getPoint (t: number): Vector2 {
    const v0 = this.v0; const v1 = this.v1; const v2 = this.v2

    this.vector.set(
      quadraticBezier(t, v0.x, v1.x, v2.x),
      quadraticBezier(t, v0.y, v1.y, v2.y)
    )

    return this.vector
  }
}

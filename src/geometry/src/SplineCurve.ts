
import { Vector2 } from './Vector2.ts'
import { catmullRom } from '../../math'

export class SplineCurve {
  private readonly points: Vector2[]
  private readonly vector = new Vector2()

  constructor (points: Vector2[]) {
    this.points = points
  }

  getPoint (t: number): Vector2 {
    const points = this.points
    const p = (points.length - 1) * t
    const intPoint = Math.floor(p)
    const weight = p - intPoint

    const point0 = points[intPoint === 0 ? intPoint : intPoint - 1]
    const point1 = points[intPoint]
    const point2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1]
    const point3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2]

    this.vector.set(
      catmullRom(weight, point0.x, point1.x, point2.x, point3.x),
      catmullRom(weight, point0.y, point1.y, point2.y, point3.y)
    )

    return this.vector
  }
}

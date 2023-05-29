
export function clampNumberInRange (from: number, to: number, number: number): number {
  return Math.max(from, Math.min(to, number))
}

export function normalizeInRange (point: number, from: number, to: number): number {
  const length = to - from
  const limit = clampNumberInRange(from, to, point) - from
  return limit / length
}

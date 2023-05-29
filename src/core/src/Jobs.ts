type JobFn = () => unknown

export class Jobs {
  private jobs: JobFn[] = []

  add (job: JobFn | JobFn[]): () => void {
    const normalized = Array.isArray(job) ? job : [job]
    this.jobs.push(...normalized)
    return () => { this.delete(normalized) }
  }

  delete (job: JobFn | JobFn[]): void {
    const normalized = Array.isArray(job) ? job : [job]
    this.jobs = this.jobs.filter((item) => !normalized.includes(item))
  }

  run (): void {
    this.jobs.forEach((job) => job())
    this.jobs = []
  }
}

export class Jobs {
  constructor() {
    this.jobs = [];
  }

  run() {
    const jobs = [...this.jobs];
    jobs.forEach((fn) => fn());
  }

  add(fn) {
    if (Array.isArray(fn)) {
      fn.forEach((item) => this.add(item));
    } else {
      this.jobs.push(fn);
    }
    return () => {
      this.delete(fn);
    };
  }

  addOnce(fn) {
    const mode = () => {
      fn();
      this.delete(mode);
    };
    return this.add(mode);
  }

  delete(fn) {
    if (Array.isArray(fn)) {
      fn.forEach((item) => this.delete(item));
      return;
    }

    this.jobs = this.jobs.filter((item) => item !== fn);
  }
}

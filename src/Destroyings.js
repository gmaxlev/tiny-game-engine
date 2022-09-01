export class Destroyings {
  #list = [];

  add(fn) {
    if (Array.isArray(fn)) {
      this.#list = this.#list.concat(fn);
    } else {
      this.#list.push(fn);
    }
  }

  call() {
    for (let i = 0; i < this.#list.length; i++) {
      this.#list[i].destroy();
    }
    this.#list = [];
  }
}

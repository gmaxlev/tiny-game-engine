export class EventEmitter {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(event, fn) {
    if (Array.isArray(event)) {
      event.forEach((eventName) => {
        if (!this.subscribers.has(eventName)) {
          this.subscribers.set(eventName, [fn]);
        } else {
          this.subscribers.get(eventName).push(fn);
        }
      });

      return () => {
        event.forEach((eventName) => {
          this.unsubscribe(eventName, fn);
        });
      };
    }

    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [fn]);
    } else {
      this.subscribers.get(event).push(fn);
    }
    return () => {
      this.unsubscribe(event, fn);
    };
  }

  subscribeOnce(event, fn) {
    const onceFn = (...value) => {
      fn(...value);
      this.unsubscribe(event, onceFn);
    };

    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [onceFn]);
    } else {
      this.subscribers.get(event).push(onceFn);
    }
    return () => {
      this.unsubscribe(event, onceFn);
    };
  }

  unsubscribe(event, fn) {
    const listeners = this.subscribers.get(event);

    if (listeners) {
      let was = false;
      const update = listeners.filter((item) => {
        const check = item !== fn;
        if (!check) {
          was = true;
        }
        return check;
      });

      if (!update.length) {
        this.subscribers.delete(event);
      } else {
        this.subscribers.set(event, update);
      }
      return was;
    }
    return false;
  }

  emit(event, ...value) {
    let listeners = this.subscribers.get(event);
    if (listeners) {
      listeners = [...listeners];
      listeners.forEach((listener) => listener(...value));
      return true;
    }
    return false;
  }

  clear() {
    this.subscribers.clear();
  }
}

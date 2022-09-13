import { EventEmitter } from "../EventEmitter";
import { Game } from "../Game";

/**
 * Base class for all entities
 * Allows to minimize render calls by marks for update
 * For example, if a game object has to render a new image,
 * it has to call markForUpdate() first to say subscribers to make a mark too,
 * and unmarkForUpdate() if the game object do not have to render anymore.
 */
export class GameObject {
  static EVENTS = {
    MARK_FOR_UPDATE: Symbol("MARK_FOR_UPDATE"),
    UNMARK_FOR_UPDATE: Symbol("UNMARK_FOR_UPDATE"),
  };

  constructor() {
    this.events = new EventEmitter();

    this._marksForUpdate = {
      // Own marks
      self: new Map(),
      // The marks amount of all listening game objects
      subscriptions: 0,
    };

    /**
     * Time of the latest update
     * @type {number|null}
     * @protected
     */
    this._lastUpdate = null;

    /**
     * Map of all subscribers
     * @type {Map<GameObject, {unsubscribes}>}
     * @private
     */
    this._subscribers = new Map();

    /**
     * True if it is destroyed
     * @type {boolean}
     * @protected
     */
    this._destroyed = false;
  }

  /**
   * Subscribes a game object to listening all marks
   * @param {GameObject} gameObject
   * @returns {(function(): void)|*} Unsubscribe function
   */
  subscribe(gameObject) {
    if (this._destroyed || gameObject._destroyed) {
      return;
    }

    const unsubscribes = [];

    unsubscribes.push(
      this.events.subscribe(GameObject.EVENTS.MARK_FOR_UPDATE, (marks) => {
        gameObject._addSubscribedMark(marks);
      }),
      this.events.subscribe(GameObject.EVENTS.UNMARK_FOR_UPDATE, (marks) => {
        gameObject._removeSubscribedMark(marks);
      })
    );

    const existingMarks =
      this._marksForUpdate.self.size + this._marksForUpdate.subscriptions;

    if (existingMarks > 0) {
      gameObject._addSubscribedMark(existingMarks);
    }

    this._subscribers.set(gameObject, { unsubscribes });

    return () => {
      this.unsubscribe(gameObject);
    };
  }

  /**
   * Unsubscribes a game object from listening all marks
   * @param {GameObject} gameObject
   */
  unsubscribe(gameObject) {
    if (this._destroyed) {
      return;
    }

    if (this._subscribers.has(gameObject)) {
      const existingMarks =
        this._marksForUpdate.self.size + this._marksForUpdate.subscriptions;

      if (existingMarks > 0) {
        gameObject._removeSubscribedMark(existingMarks);
      }

      this._subscribers.get(gameObject).unsubscribes.forEach((fn) => fn());
      this._subscribers.delete(gameObject);
    }
  }

  /**
   * Adds a mark that reports about the need of updating
   * @param {*} mark Some uniq value
   * @param {Number} frames An amount of frames or Infinity
   */
  markForUpdate(mark, frames = Infinity) {
    if (this._destroyed) {
      return;
    }

    if (!this._marksForUpdate.self.has(mark)) {
      this._marksForUpdate.self.set(mark, frames);
      this.events.emit(GameObject.EVENTS.MARK_FOR_UPDATE, 1);
    }
  }

  /**
   * Removes a mark
   * @param {*} mark Mark
   */
  unmarkForUpdate(mark) {
    if (this._destroyed) {
      return;
    }

    if (this._marksForUpdate.self.has(mark)) {
      this._marksForUpdate.self.delete(mark);
      this.events.emit(GameObject.EVENTS.UNMARK_FOR_UPDATE, 1);
    }
  }

  /**
   * Should be called in each frame
   * Returns true if the game object should render
   * @returns {boolean}
   */
  update() {
    if (this._destroyed || this._lastUpdate === Game.time) {
      return false;
    }

    if (
      this._marksForUpdate.self.size === 0 &&
      this._marksForUpdate.subscriptions === 0
    ) {
      return false;
    }

    let deletingMarks = 0;
    this._marksForUpdate.self.forEach((value, key, map) => {
      if (value - 1 === 0) {
        map.delete(key);
        deletingMarks += 1;
      } else {
        map.set(key, value - 1);
      }
    });

    if (deletingMarks > 0) {
      this.events.emit(GameObject.EVENTS.UNMARK_FOR_UPDATE, deletingMarks);
    }

    this._lastUpdate = Game.time;

    return true;
  }

  /**
   * Clears memory and destroys all services
   */
  destroy() {
    if (this._destroyed) {
      return;
    }

    this.events.emit(
      GameObject.EVENTS.UNMARK_FOR_UPDATE,
      this._marksForUpdate.self.size
    );
    this._marksForUpdate.self.clear();
    this.events.clear();
    this._destroyed = true;
  }

  /**
   * Called when listening game objects calls markForUpdate()
   * @param {number} marks Amount of marks
   * @private
   */
  _addSubscribedMark(marks) {
    if (this._destroyed) {
      return;
    }
    this._marksForUpdate.subscriptions += marks;
    this.events.emit(GameObject.EVENTS.MARK_FOR_UPDATE, marks);
  }

  /**
   * Called when listening game objects calls unmarkForUpdate()
   * @param {number} marks Amount of marks
   * @private
   */
  _removeSubscribedMark(marks) {
    if (this._destroyed) {
      return;
    }
    this._marksForUpdate.subscriptions -= marks;
    this.events.emit(GameObject.EVENTS.UNMARK_FOR_UPDATE, marks);
  }
}

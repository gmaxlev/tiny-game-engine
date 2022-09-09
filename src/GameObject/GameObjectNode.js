import { Jobs } from "../Jobs";
import { GameObject } from "./GameObject";

/**
 * Game object
 * Used when it needs to create better performance
 */
export class GameObjectNode extends GameObject {
  static EVENTS = {
    MARK_FOR_UPDATE: Symbol("MARK_FOR_UPDATE"),
    UNMARK_FOR_UPDATE: Symbol("UNMARK_FOR_UPDATE"),
    BEFORE_DESTROYING: Symbol("BEFORE_DESTROYING"),
  };

  constructor({ width, height, visible = true }) {
    super({ width, height, visible });
    this._marksForUpdate = {
      marks: [],
      frames: [],
      marksConnected: 0,
      framesConnected: 0,
    };
    this._connectedGameObjectNodes = [];
    this._disconnectingGameObjectNodesJobs = new Map();
    this.destroyingJobs = new Jobs();
  }

  /** @param {GameObjectNode|Array} gameObjectNode */
  connect(gameObjectNode) {
    if (Array.isArray(gameObjectNode)) {
      gameObjectNode.forEach((item) => this.connect(item));
      return;
    }

    if (this._destroyed || gameObjectNode._destroyed) {
      return;
    }

    const unsubscribes = [];

    unsubscribes.push(
      gameObjectNode.events.subscribe(
        GameObjectNode.EVENTS.MARK_FOR_UPDATE,
        (marks, frames) => {
          this._marksForUpdate.marksConnected += marks;
          this._marksForUpdate.framesConnected += frames;

          this.events.emit(
            GameObjectNode.EVENTS.MARK_FOR_UPDATE,
            marks,
            frames
          );
        }
      )
    );

    unsubscribes.push(
      gameObjectNode.events.subscribe(
        GameObjectNode.EVENTS.UNMARK_FOR_UPDATE,
        (marks, frames) => {
          this._marksForUpdate.marksConnected -= marks;
          this._marksForUpdate.framesConnected -= frames;

          this.events.emit(
            GameObjectNode.EVENTS.UNMARK_FOR_UPDATE,
            marks,
            frames
          );
        }
      )
    );

    unsubscribes.push(
      gameObjectNode.events.subscribeOnce(
        GameObjectNode.EVENTS.BEFORE_DESTROYING,
        () => {
          this._disconnectingGameObjectNodesJobs
            .get(gameObjectNode)
            .forEach((fn) => fn());
          this._disconnectingGameObjectNodesJobs.delete(gameObjectNode);

          gameObjectNode._connectedGameObjectNodes =
            gameObjectNode._connectedGameObjectNodes.filter(
              (go) => go !== this
            );
        }
      )
    );

    unsubscribes.push(
      this.events.subscribeOnce(GameObjectNode.EVENTS.BEFORE_DESTROYING, () => {
        gameObjectNode._connectedGameObjectNodes =
          gameObjectNode._connectedGameObjectNodes.filter((go) => go !== this);
        gameObjectNode.destroy(false);
      })
    );

    gameObjectNode._connectedGameObjectNodes.push(this);

    const { marks, frames } = gameObjectNode._getCountMarks();

    if (marks !== 0 || frames !== 0) {
      this._marksForUpdate.marksConnected += marks;
      this._marksForUpdate.framesConnected += frames;
      this.events.emit(GameObjectNode.EVENTS.MARK_FOR_UPDATE, marks, frames);
    }

    this._disconnectingGameObjectNodesJobs.set(gameObjectNode, unsubscribes);
  }

  /** @param {GameObjectNode} gameObjectNode */
  disconnect(gameObjectNode) {
    if (this._destroyed) {
      return;
    }

    this._disconnectingGameObjectNodesJobs
      .get(gameObjectNode)
      .forEach((fn) => fn());
    this._disconnectingGameObjectNodesJobs.delete(gameObjectNode);

    gameObjectNode._connectedGameObjectNodes =
      gameObjectNode._connectedGameObjectNodes.filter((go) => go !== this);

    const { marks, frames } = gameObjectNode._getCountMarks();

    this._marksForUpdate.marksConnected -= marks;
    this._marksForUpdate.framesConnected -= frames;
    this.events.emit(GameObjectNode.EVENTS.UNMARK_FOR_UPDATE, marks, frames);
  }

  destroy(isInitial = true) {
    if (
      (!isInitial && this._connectedGameObjectNodes.length) ||
      this._destroyed
    ) {
      return;
    }

    if (isInitial) {
      const { marks, frames } = this._getCountMarks();
      this.events.emit(GameObjectNode.EVENTS.UNMARK_FOR_UPDATE, marks, frames);
    }

    this.events.emit(GameObjectNode.EVENTS.BEFORE_DESTROYING);

    for (const item of this._disconnectingGameObjectNodesJobs.values()) {
      item.forEach((fn) => fn());
    }
    this._disconnectingGameObjectNodesJobs.clear();

    this.destroyingJobs.run();
    this.events.clear();

    this._destroyed = true;
  }

  _getCountMarks() {
    let marks = this._marksForUpdate.marksConnected;
    let frames = this._marksForUpdate.framesConnected;

    this._marksForUpdate.frames.forEach((count) => {
      if (count === Infinity) {
        marks += 1;
      } else {
        frames += count;
      }
    });

    return {
      marks,
      frames,
    };
  }

  markForUpdate(mark, frames = Infinity) {
    if (this._destroyed) {
      return;
    }

    if (this._marksForUpdate.marks.indexOf(mark) === -1) {
      this._marksForUpdate.marks.push(mark);
      this._marksForUpdate.frames.push(frames);
      const isInfinity = frames === Infinity;
      this.events.emit(
        GameObjectNode.EVENTS.MARK_FOR_UPDATE,
        isInfinity ? 1 : 0,
        isInfinity ? 0 : frames
      );
    }
  }

  unmarkForUpdate(mark) {
    if (this._destroyed) {
      return;
    }

    const index = this._marksForUpdate.marks.indexOf(mark);
    if (index !== -1) {
      this._marksForUpdate.marks.splice(index, 1);
      const frames = this._marksForUpdate.frames.splice(index, 1);
      const isInfinity = frames[0] === Infinity;
      this.events.emit(
        GameObjectNode.EVENTS.UNMARK_FOR_UPDATE,
        isInfinity ? 1 : 0,
        isInfinity ? 0 : frames
      );
    }
  }

  clear() {
    if (this._destroyed) {
      return;
    }

    this.ctx.clearRect(0, 0, this.size.width, this.size.height);
  }

  update() {
    if (this._destroyed) {
      return;
    }

    const marks = this._marksForUpdate.frames.length > 0;

    let offset = 0;
    this._marksForUpdate.frames = this._marksForUpdate.frames
      .map((item) => item - 1)
      .filter((item, index) => {
        if (item === 0) {
          this._marksForUpdate.marks.splice(index - offset, 1);
          offset += 1;
          return false;
        }
        return true;
      });

    if (
      !marks &&
      this._marksForUpdate.marksConnected === 0 &&
      this._marksForUpdate.framesConnected === 0
    ) {
      return this.canvas;
    }

    this._marksForUpdate.framesConnected = Math.max(
      this._marksForUpdate.framesConnected - 1,
      0
    );

    this.clear();
    this.draw();

    return this.canvas;
  }

  drawTo(ctx, x = 0, y = 0) {
    if (!this.visible || this._destroyed) {
      return;
    }

    const updated = this.update();
    if (updated) {
      ctx.drawImage(updated, x, y);
    }
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

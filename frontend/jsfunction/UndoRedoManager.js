// You are free to use alternative approaches of
// defining UndoRedoManager as long as the
// default export can be instantiated.
/**
 * @template T
 */
/**
 * Store all values in a history array and keep an index pointer to the current value.
 * --
set():
- discard everything after current index
- push the new value
- move pointer to the end
=================
undo():
- move pointer left if possible
=================
redo():
- move pointer right if possible
=================
reset():
- restore history back to only the initial value
 */
export default class UndoRedoManager {
  /**
   * @param {T} initialValue
   */
  constructor(initialValue) {
    this.initialValue = initialValue;
    this.history = [initialValue];
    this.index = 0;
  }

  /**
   * @returns {T}
   */
  getCurrent() {
    return this.history[this.index];
  }

  /**
   * @param {T} value
   * @returns {void}
   */
  set(value) {
    // Remove redo history before adding new value.
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(value);
    this.index++;
  }

  /**
   * @returns {void}
   */
  undo() {
    if (this.canUndo()) {
      this.index--;
    }
  }

  /**
   * @returns {void}
   */
  redo() {
    if (this.canRedo()) {
      this.index++;
    }
  }

  /**
   * @returns {void}
   */
  reset() {
    this.history = [this.initialValue];
    this.index = 0;
  }

  /**
   * @returns {boolean}
   */
  canUndo() {
    return this.index > 0;
  }

  /**
   * @returns {boolean}
   */
  canRedo() {
    return this.index < this.history.length - 1;
  }
}
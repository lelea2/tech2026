/**
 * In many products, successive updates should be grouped into a single undo step. 
 * For example, typing three characters into a text editor often 
 * should not require three separate undo presses. 
 * Instead, the app may keep updating the visible value while
 * only committing a history checkpoint once the typing burst is done.
 */
/**
 * =========================================================
 * Undo / Redo Manager with Draft + Commit
 * =========================================================
 *
 * Data Structure:
 * - history[] array
 * - index pointer
 * - pending draft value
 *
 * =========================================================
 * Core Idea
 * =========================================================
 *
 * There are TWO states:
 *
 * 1. Committed history
 *    - undo/redo operates on this
 *
 * 2. Draft state
 *    - temporary live edits
 *    - created by set()
 *    - only saved permanently by commit()
 *
 * Example:
 *
 * history = ['', 'hel']
 * index = 1
 *
 * set('hello')
 *
 * draft = 'hello'
 *
 * undo()
 * => discard draft
 * => back to committed 'hel'
 *
 * =========================================================
 * Why Draft Exists?
 * =========================================================
 *
 * Real editors batch rapid edits together.
 *
 * Typing:
 * h -> he -> hel
 *
 * should not create:
 * ['', 'h', 'he', 'hel']
 *
 * Instead:
 *
 * history = ['']
 * draft = 'hel'
 *
 * commit()
 *
 * history = ['', 'hel']
 *
 * =========================================================
 * Time Complexity
 * =========================================================
 *
 * getCurrent: O(1)
 * set:        O(1)
 * commit:     O(n) because slice() may copy
 * undo:       O(1)
 * redo:       O(1)
 * reset:      O(1)
 *
 * =========================================================
 * Space Complexity
 * =========================================================
 *
 * O(n) history size
 */

export default class UndoRedoManager {
  /**
   * @template T
   * @param {T} initialValue
   */
  constructor(initialValue) {
    /**
     * Original initial value for reset().
     */
    this.initialValue = initialValue;

    /**
     * Committed undo/redo history.
     */
    this.history = [initialValue];

    /**
     * Current committed history position.
     */
    this.index = 0;

    /**
     * Current uncommitted draft.
     *
     * null means:
     * no pending draft exists.
     */
    this.draft = null;
  }

  /**
   * Return visible current value.
   *
   * Priority:
   * 1. draft if exists
   * 2. committed history value
   *
   * @returns {unknown}
   */
  getCurrent() {
    return this.draft !== null
      ? this.draft
      : this.history[this.index];
  }

  /**
   * Update current draft.
   *
   * Important:
   * - does NOT create undo history immediately
   * - multiple set() calls belong to same batch
   *
   * If redo history exists:
   *
   * ['', 'hel', 'hello']
   *       ^
   *
   * set('hey')
   *
   * redo history must be discarded immediately.
   *
   * @param {unknown} value
   * @returns {void}
   */
  set(value) {
    /**
     * First draft edit after undo:
     * clear redo history immediately.
     */
    if (
      this.draft === null &&
      this.index < this.history.length - 1
    ) {
      this.history = this.history.slice(
        0,
        this.index + 1,
      );
    }

    this.draft = value;
  }

  /**
   * Commit current draft into history.
   *
   * Draft becomes one undo step.
   *
   * @returns {void}
   */
  commit() {
    // Nothing to commit.
    if (this.draft === null) {
      return;
    }

    this.history.push(this.draft);

    this.index++;

    // Draft becomes committed.
    this.draft = null;
  }

  /**
   * Undo behavior:
   *
   * Case 1:
   * draft exists
   * => discard draft only
   *
   * Case 2:
   * move backward in committed history
   *
   * @returns {void}
   */
  undo() {
    /**
     * Draft undo:
     * discard temporary edits.
     */
    if (this.draft !== null) {
      this.draft = null;
      return;
    }

    if (this.canUndo()) {
      this.index--;
    }
  }

  /**
   * Move forward in committed history.
   *
   * Drafts are NOT redoable.
   *
   * @returns {void}
   */
  redo() {
    if (this.canRedo()) {
      this.index++;
    }
  }

  /**
   * Reset everything back to initial state.
   *
   * @returns {void}
   */
  reset() {
    this.history = [this.initialValue];
    this.index = 0;
    this.draft = null;
  }

  /**
   * Undo possible if:
   * - draft exists
   * OR
   * - earlier committed history exists
   *
   * @returns {boolean}
   */
  canUndo() {
    return this.draft !== null || this.index > 0;
  }

  /**
   * Redo possible only for committed history.
   *
   * Drafts are never redoable.
   *
   * @returns {boolean}
   */
  canRedo() {
    return this.index < this.history.length - 1;
  }
}
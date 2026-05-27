/**
 * Database with draft-based undo/redo.
 *
 * Data structure:
 * - history: committed snapshots
 * - index: current committed snapshot pointer
 * - draft: pending uncommitted users list
 */
export default class Database {
  constructor() {
    this.history = [[]];
    this.index = 0;
    this.draft = null;
  }

  getUsers() {
    return this._cloneUsers(
      this.draft !== null ? this.draft : this.history[this.index],
    );
  }

  addUser(user) {
    const draft = this._ensureDraft();
    draft.push({ ...user });
  }

  updateUser(id, updates) {
    const draft = this._ensureDraft();
    const index = draft.findIndex((user) => user.id === id);

    if (index === -1) return;

    draft[index] = {
      ...draft[index],
      ...updates,
      id: draft[index].id, // preserve original id
    };
  }

  deleteUser(id) {
    const draft = this._ensureDraft();
    const index = draft.findIndex((user) => user.id === id);

    if (index === -1) return;

    draft.splice(index, 1);
  }

  commit() {
    if (this.draft === null) return;

    this.history.push(this._cloneUsers(this.draft));
    this.index++;
    this.draft = null;
  }

  undo() {
    // First undo discards uncommitted draft.
    if (this.draft !== null) {
      this.draft = null;
      return;
    }

    if (this.index > 0) {
      this.index--;
    }
  }

  redo() {
    // Redo only applies to committed history.
    if (this.draft !== null) return;

    if (this.index < this.history.length - 1) {
      this.index++;
    }
  }

  reset() {
    this.history = [[]];
    this.index = 0;
    this.draft = null;
  }

  _ensureDraft() {
    if (this.draft === null) {
      // Starting a new draft after undo clears redo history.
      if (this.index < this.history.length - 1) {
        this.history = this.history.slice(0, this.index + 1);
      }

      this.draft = this._cloneUsers(this.history[this.index]);
    }

    return this.draft;
  }

  _cloneUsers(users) {
    return users.map((user) => ({ ...user }));
  }
}
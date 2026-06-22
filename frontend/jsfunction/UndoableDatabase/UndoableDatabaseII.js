/**
 * Interview question: Undoable Database II
 *
 * Implement an in-memory user database with undo/redo, but add a draft layer.
 *
 * Difference from UndoableDatabase I:
 * - Version I commits every add/update/delete immediately.
 * - Version II lets add/update/delete modify a pending draft.
 * - The draft becomes part of undo/redo history only when commit() is called.
 *
 * This models apps where users make several edits and then explicitly save.
 *
 * Data structure:
 * - history: committed snapshots
 * - index: current committed snapshot pointer
 * - draft: pending uncommitted users list
 *
 * Behavior:
 * - getUsers returns the draft if one exists; otherwise it returns the current
 *   committed snapshot.
 * - undo first discards an uncommitted draft.
 * - redo is disabled while a draft exists.
 * - starting a new draft after undo clears redo history.
 *
 * Time:
 * - getUsers: O(n), because users are cloned before returning.
 * - addUser: O(n) when creating the first draft, then O(1).
 * - updateUser/deleteUser: O(n).
 * - commit: O(n).
 * - undo/redo: O(1), except discarding a draft is O(1).
 *
 * Space:
 * - O(n * h + n), for committed snapshots plus one draft.
 */
export default class Database {
  constructor() {
    // One empty committed snapshot plus no active draft.
    this.history = [[]];
    this.index = 0;
    this.draft = null;
  }

  getUsers() {
    // Draft state is what the user currently sees before commit.
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

    // Commit groups all draft edits into one undo/redo history step.
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
    // Reset clears committed history and any pending draft.
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

      // Start the draft from the currently visible committed snapshot.
      this.draft = this._cloneUsers(this.history[this.index]);
    }

    return this.draft;
  }

  _cloneUsers(users) {
    // Defensive copy prevents callers or drafts from mutating history snapshots.
    return users.map((user) => ({ ...user }));
  }
}

/**
 * Example walkthrough:
 *
 * const db = new Database();
 * db.addUser({ id: 1, name: "Ava" });
 * db.addUser({ id: 2, name: "Ben" });
 * db.getUsers();
 *
 * Output before commit:
 * [
 *   { id: 1, name: "Ava" },
 *   { id: 2, name: "Ben" }
 * ]
 *
 * db.undo();
 * db.getUsers();
 *
 * Output after undoing the draft:
 * []
 *
 * db.addUser({ id: 1, name: "Ava" });
 * db.commit();
 * db.updateUser(1, { name: "Ava Lee" });
 * db.commit();
 * db.getUsers();
 *
 * Output:
 * [{ id: 1, name: "Ava Lee" }]
 *
 * db.undo();
 * db.getUsers();
 *
 * Output:
 * [{ id: 1, name: "Ava" }]
 *
 * db.redo();
 * db.getUsers();
 *
 * Output:
 * [{ id: 1, name: "Ava Lee" }]
 */

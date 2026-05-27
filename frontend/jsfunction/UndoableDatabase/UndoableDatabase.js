/**
 * Database with undo/redo history for CRUD operations.
 *
 * Data structure:
 * - history: array of database snapshots
 * - index: pointer to current snapshot
 *
 * Each successful CRUD operation:
 * - creates a new users array
 * - discards redo history
 * - pushes one new snapshot
 */
export default class Database {
  constructor() {
    this.history = [[]];
    this.index = 0;
  }

  getUsers() {
    return this.history[this.index].map((user) => ({ ...user }));
  }

  addUser(user) {
    const users = this.getUsers();

    users.push({ ...user });

    this._commit(users);
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) return;

    users[index] = {
      ...users[index],
      ...updates,
      id: users[index].id, // preserve original id
    };

    this._commit(users);
  }

  deleteUser(id) {
    const users = this.getUsers();
    const nextUsers = users.filter((user) => user.id !== id);

    if (nextUsers.length === users.length) return;

    this._commit(nextUsers);
  }

  undo() {
    if (this.index > 0) {
      this.index--;
    }
  }

  redo() {
    if (this.index < this.history.length - 1) {
      this.index++;
    }
  }

  _commit(users) {
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(users.map((user) => ({ ...user })));
    this.index++;
  }
}
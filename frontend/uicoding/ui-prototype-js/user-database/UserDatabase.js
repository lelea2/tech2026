import { useMemo, useState } from "react";
import styles from "./App.module.css";

const initialUsers = [
  { id: 1, firstName: "Hans", lastName: "Emil" },
  { id: 2, firstName: "Max", lastName: "Mustermann" },
  { id: 3, firstName: "Roman", lastName: "Tisch" },
];

export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const selectedUser =
    users.find((user) => user.id === selectedId) ?? null;

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();

    return users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  const canCreate =
    !selectedUser &&
    firstName.trim() &&
    lastName.trim();

  const hasSelectedUser = Boolean(selectedUser);

  const clearForm = () => {
    setSelectedId(null);
    setFirstName("");
    setLastName("");
  };

  const handleSelect = (user) => {
    setSelectedId(user.id);
    setFirstName(user.firstName);
    setLastName(user.lastName);
  };

  const handleCreate = () => {
    if (!canCreate) return;

    const newUser = {
      id: Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    setUsers((prev) => [...prev, newUser]);
    clearForm();
  };

  const handleUpdate = () => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
            }
          : user
      )
    );
  };

  const handleDelete = () => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.filter((user) => user.id !== selectedUser.id)
    );

    clearForm();
  };

  return (
    <main className="container">
      <h1 className="title">Users Database</h1>

      <div className="search">
        <label>
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="field"
          />
        </label>
      </div>

      <div className="content">
        <select
          size={8}
          value={selectedId ?? ""}
          className="listbox field"
          onChange={(e) => {
            const user = users.find(
              (u) => u.id === Number(e.target.value)
            );

            if (user) handleSelect(user);
          }}
        >
          {filteredUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.lastName}, {user.firstName}
            </option>
          ))}
        </select>

        <div className="form">
          <label>
            First Name
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="field"
            />
          </label>

          <label>
            Last Name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="field"
            />
          </label>
        </div>
      </div>

      <div className="actions">
        <button
          onClick={handleCreate}
          disabled={!canCreate}
        >
          Create
        </button>

        <button
          onClick={handleUpdate}
          disabled={!hasSelectedUser}
        >
          Update
        </button>

        <button
          onClick={handleDelete}
          disabled={!hasSelectedUser}
        >
          Delete
        </button>

        <button
          onClick={clearForm}
          disabled={!hasSelectedUser}
        >
          Cancel
        </button>
      </div>
    </main>
  );
}

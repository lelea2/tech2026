import DataTable from './DataTable';
import users from './data/users';
import houses from './data/houses';

const userColumns = [
  {
    label: 'ID',
    key: 'id',
    renderCell: (user) => user.id,
    comparator: (a, b, direction) =>
      direction === 'asc' ? a.id - b.id : b.id - a.id,
    filter: {
      type: 'range',
      getValue: (user) => user.id,
    },
  },
  {
    label: 'Name',
    key: 'name',
    renderCell: (user) => user.name,
    comparator: (a, b, direction) =>
      direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    filter: {
      type: 'text',
      getValue: (user) => user.name,
    },
  },
  {
    label: 'Age',
    key: 'age',
    renderCell: (user) => user.age,
    comparator: (a, b, direction) =>
      direction === 'asc' ? a.age - b.age : b.age - a.age,
    filter: {
      type: 'range',
      getValue: (user) => user.age,
    },
  },
  {
    label: 'Occupation',
    key: 'occupation',
    renderCell: (user) => user.occupation,
    comparator: (a, b, direction) =>
      direction === 'asc'
        ? a.occupation.localeCompare(b.occupation)
        : b.occupation.localeCompare(a.occupation),
    filter: {
      type: 'text',
      getValue: (user) => user.occupation,
    },
  },
];

const houseColumns = [
  {
    label: 'ID',
    key: 'id',
    renderCell: (house) => house.id,
    comparator: (a, b, direction) =>
      direction === 'asc' ? a.id - b.id : b.id - a.id,
    filter: {
      type: 'range',
      getValue: (house) => house.id,
    },
  },
  {
    label: 'Street',
    key: 'street',
    renderCell: (house) => house.street,
    comparator: (a, b, direction) =>
      direction === 'asc'
        ? a.street.localeCompare(b.street)
        : b.street.localeCompare(a.street),
    filter: {
      type: 'text',
      getValue: (house) => house.street,
    },
  },
  {
    label: 'City',
    key: 'city',
    renderCell: (house) => house.city,
    comparator: (a, b, direction) =>
      direction === 'asc'
        ? a.city.localeCompare(b.city)
        : b.city.localeCompare(a.city),
    filter: {
      type: 'text',
      getValue: (house) => house.city,
    },
  },
  {
    label: 'State',
    key: 'state',
    renderCell: (house) => house.state,
    comparator: (a, b, direction) =>
      direction === 'asc'
        ? a.state.localeCompare(b.state)
        : b.state.localeCompare(a.state),
    filter: {
      type: 'text',
      getValue: (house) => house.state,
    },
  },
  {
    label: 'Built Year',
    key: 'built_year',
    renderCell: (house) => house.built_year,
    comparator: (a, b, direction) =>
      direction === 'asc'
        ? a.built_year - b.built_year
        : b.built_year - a.built_year,
    filter: {
      type: 'range',
      getValue: (house) => house.built_year,
    },
  },
];

export default function App() {
  return (
    <main>
      <h2>Users</h2>
      <DataTable data={users} columns={userColumns} />

      <br />

      <h2>Houses</h2>
      <DataTable data={houses} columns={houseColumns} />
    </main>
  );
}

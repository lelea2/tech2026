import React, { useState } from "react";

type FieldType = "text" | "number" | "checkbox" | "select";

type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
};

type FormValues = Record<string, string | number | boolean>;

type GenericFormProps = {
  fields: FieldConfig[];
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => void;
};

export function GenericForm({
  fields,
  initialValues = {},
  onSubmit,
}: GenericFormProps) {
  const [values, setValues] = useState<FormValues>(() => {
    const result: FormValues = {};

    for (const field of fields) {
      result[field.name] =
        initialValues[field.name] ??
        (field.type === "checkbox"
          ? false
          : field.type === "number"
          ? 0
          : "");
    }

    return result;
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = event.target;

    let nextValue: string | number | boolean = value;

    if (type === "checkbox") {
      nextValue = (event.target as HTMLInputElement).checked;
    }

    if (type === "number") {
      nextValue = Number(value);
    }

    setValues((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>

          {field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              value={String(values[field.name])}
              onChange={handleChange}
            >
              <option value="">Select...</option>

              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              checked={
                field.type === "checkbox"
                  ? Boolean(values[field.name])
                  : undefined
              }
              value={
                field.type !== "checkbox"
                  ? String(values[field.name])
                  : undefined
              }
              required={field.required}
              onChange={handleChange}
            />
          )}
        </div>
      ))}

      <button type="submit">Submit</button>
    </form>
  );
}

// Exmple usage:
// const fields = [
//   {
//     name: "name",
//     label: "Name",
//     type: "text",
//     required: true,
//   },
//   {
//     name: "age",
//     label: "Age",
//     type: "number",
//   },
//   {
//     name: "newsletter",
//     label: "Subscribe",
//     type: "checkbox",
//   },
//   {
//     name: "role",
//     label: "Role",
//     type: "select",
//     options: ["Engineer", "Designer", "Manager"],
//   },
// ] satisfies FieldConfig[];

// function App() {
//   return (
//     <GenericForm
//       fields={fields}
//       onSubmit={(values) => {
//         console.log(values);
//       }}
//     />
//   );
// }
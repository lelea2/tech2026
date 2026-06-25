import { useState } from "react";

function getInitialValues(fields) {
  const values = {};

  fields.forEach((field) => {
    if (field.type === "checkbox") {
      values[field.name] = false;
    } else {
      values[field.name] = "";
    }
  });

  return values;
}

function validateField(field, value) {
  if (field.required) {
    if (field.type === "checkbox" && !value) {
      return `${field.label} is required`;
    }

    if (field.type !== "checkbox" && !String(value).trim()) {
      return `${field.label} is required`;
    }
  }

  if (field.validate) {
    return field.validate(value);
  }

  return "";
}

function validateForm(fields, values) {
  const errors = {};

  fields.forEach((field) => {
    const error = validateField(field, values[field.name]);

    if (error) {
      errors[field.name] = error;
    }
  });

  return errors;
}

function GenericForm({ fields, onSubmit }) {
  const [values, setValues] = useState(() => getInitialValues(fields));
  const [errors, setErrors] = useState({});

  function handleChange(field, event) {
    const value =
      field.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    const nextValues = {
      ...values,
      [field.name]: value,
    };

    setValues(nextValues);

    // Validate field on change
    const error = validateField(field, value);

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field.name]: error,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(fields, values);
    setErrors(nextErrors);

    const hasError = Object.values(nextErrors).some(Boolean);

    if (hasError) {
      return;
    }

    onSubmit(values);
  }

  function renderField(field) {
    const commonStyle = {
      width: "100%",
      padding: "8px",
      marginTop: "4px",
      boxSizing: "border-box",
    };

    if (field.type === "textarea") {
      return (
        <textarea
          value={values[field.name]}
          placeholder={field.placeholder}
          onChange={(event) => handleChange(field, event)}
          style={commonStyle}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={values[field.name]}
          onChange={(event) => handleChange(field, event)}
          style={commonStyle}
        >
          <option value="">Select an option</option>

          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={values[field.name]}
          onChange={(event) => handleChange(field, event)}
        />
      );
    }

    return (
      <input
        type={field.type}
        value={values[field.name]}
        placeholder={field.placeholder}
        onChange={(event) => handleChange(field, event)}
        style={commonStyle}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name} style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            {field.type === "checkbox" ? (
              <>
                {renderField(field)} {field.label}
              </>
            ) : (
              field.label
            )}
          </label>

          {field.type !== "checkbox" && renderField(field)}

          {errors[field.name] && (
            <div style={{ color: "red", marginTop: "4px", fontSize: "14px" }}>
              {errors[field.name]}
            </div>
          )}
        </div>
      ))}

      <button type="submit" style={{ padding: "8px 16px" }}>
        Submit
      </button>
    </form>
  );
}

const fields = [
  {
    name: "name",
    label: "Name",
    type: "text",
    placeholder: "Enter your name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
    required: true,
    validate: (value) => {
      if (!value.includes("@")) {
        return "Email must be valid";
      }
      return "";
    },
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Frontend Engineer", value: "frontend" },
      { label: "Backend Engineer", value: "backend" },
      { label: "Fullstack Engineer", value: "fullstack" },
    ],
  },
  {
    name: "bio",
    label: "Bio",
    type: "textarea",
    placeholder: "Tell us about yourself",
  },
  {
    name: "agree",
    label: "I agree to the terms",
    type: "checkbox",
    required: true,
  },
];

export default function App() {
  function handleSubmit(values) {
    console.log("Submitted values:", values);
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Generic Form</h2>

      <GenericForm fields={fields} onSubmit={handleSubmit} />
    </div>
  );
}
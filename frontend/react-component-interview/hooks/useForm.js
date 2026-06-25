import React, { useState } from "react";

export function useForm({
  initialValues,
  validate,
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function setFieldValue(name, value) {
    setValues(prev => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (validate) {
        setErrors(validate(next));
      }

      return next;
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFieldValue(name, value);
  }

  function handleBlur(e) {
    const { name } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate
      ? validate(values)
      : {};

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  }

  function reset() {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
  };
}

// Example usage
function LoginForm() {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },

    validate(values) {
      const errors = {};

      if (!values.email.includes("@")) {
        errors.email = "Invalid email";
      }

      if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }

      return errors;
    },

    onSubmit(values) {
      console.log("submit", values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && <p>{form.errors.email}</p>}

      <input
        name="password"
        type="password"
        value={form.values.password}
        onChange={form.handleChange}
      />

      <label>
        <input
          name="remember"
          type="checkbox"
          checked={form.values.remember}
          onChange={form.handleChange}
        />
        Remember me
      </label>

      <button disabled={form.isSubmitting}>Submit</button>
    </form>
  );
}
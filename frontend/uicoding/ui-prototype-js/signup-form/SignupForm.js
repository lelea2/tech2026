import { useState } from "react";
import submitForm from "./submitForm";

export default function SignupForm() {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  function validate(values) {
    const newErrors = {};

    if (values.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters.";
    } else if (!/^[a-zA-Z0-9]+$/.test(values.username)) {
      newErrors.username = "Username must be alphanumeric only.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (values.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (values.confirmPassword !== values.password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await submitForm(values);
  }

  const fieldClass = "w-full px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-orange-500 text-white placeholder-slate-500";
  const labelClass = "block text-xs text-slate-400 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="username" className={labelClass}>Username</label>
        <input
          id="username"
          name="username"
          value={values.username}
          onChange={handleChange}
          placeholder="e.g. john123"
          className={fieldClass}
        />
        {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={fieldClass}
        />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          placeholder="Min. 6 characters"
          className={fieldClass}
        />
        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          placeholder="Repeat your password"
          className={fieldClass}
        />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        className="w-full py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
      >
        Sign Up
      </button>
    </form>
  );
}

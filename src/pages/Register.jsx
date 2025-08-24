// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    age: "",
    password: "",
    target_language: "Tamil",
    known_language: "English",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({
        email: form.email.trim(),
        age: Number(form.age),
        password: form.password,
        target_language: form.target_language,
        known_language: form.known_language,
      });
      navigate("/login");
    } catch (err) {
      const res = err?.response;
      let msg = "Register failed";
      if (res?.data) {
        const data = res.data;
        if (typeof data === "string") msg = data;
        else if (data.detail) msg = data.detail;
        else {
          msg = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
            .join(" | ");
        }
      } else if (err?.message) {
        // Network/CORS, timeouts etc.
        msg = `Network error: ${err.message}`;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Create account</h2>
      <form onSubmit={onSubmit} className="form" noValidate>
        <label>Email
          <input name="email" type="email" required value={form.email} onChange={onChange}/>
        </label>
        <label>Age
          <input name="age" type="number" required value={form.age} onChange={onChange}/>
        </label>
        <label>Password
          <input name="password" type="password" required value={form.password} onChange={onChange}/>
        </label>
        <label>Known language
          <input name="known_language" value={form.known_language} onChange={onChange}/>
        </label>
        <label>Target language
          <input name="target_language" value={form.target_language} onChange={onChange}/>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

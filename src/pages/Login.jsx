import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) navigate("/translate");
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/translate");
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Email <input type="email" required
          value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></label>
        <label>Password <input type="password" required
          value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p style={{marginTop:10}}>New user? <a href="/register">Create an account</a></p>
    </div>
  );
}

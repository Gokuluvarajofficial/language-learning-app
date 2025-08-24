import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    return token ? { email, token } : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/api/login/", { email, password });
    // DEBUG: see exact response shape (open DevTools console)
    console.log("LOGIN RESPONSE:", data);
    const token = data.token ?? data.Token ?? data.access ?? data.key;
    if (!token) throw new Error("No token returned from /api/login/");
    localStorage.setItem("token", token);
    localStorage.setItem("email", data.email || email);
    setUser({ email: data.email || email, token });
  };

  const register = async (payload) => {
    const { data } = await api.post("/api/register/", payload);
    return data; // we do not auto-login; user goes to /login
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

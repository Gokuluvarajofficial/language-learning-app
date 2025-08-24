import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="nav">
      <Link to="/" className="brand">Translate App</Link>

      {user && (
        <div className="links">
          <NavLink to="/translate">Translate List</NavLink>
          <NavLink to="/translate/create">Create Translate</NavLink>
          <NavLink to="/lesson/1">Lesson #1</NavLink>
          <NavLink to="/lesson/create">Create Lesson</NavLink>
        </div>
      )}

      <div className="auth">
        {user ? (
          <>
            <span className="email">{user.email}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

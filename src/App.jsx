import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";        // optional, not used as landing now
import Login from "./pages/Login";
import Register from "./pages/Register";
import TranslateList from "./pages/TranslateList";
import TranslateDetail from "./pages/TranslateDetail";
import TranslateCreate from "./pages/TranslateCreate";
import LessonView from "./pages/LessonView";
import LessonCreate from "./pages/LessonCreate";
import AuthProvider, { useAuth } from "./context/AuthContext";
import "./styles/global.css";

function Private({ children }) {
  const { user } = useAuth();
  if (!user) return <div className="card"><p>Please login first.</p></div>;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <main className="container">
          <Routes>
            {/* Landing should be Login */}
            <Route path="/" element={<Login />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/translate" element={
              <Private><TranslateList /></Private>
            } />
            <Route path="/translate/create" element={
              <Private><TranslateCreate /></Private>
            } />
            <Route path="/translate/:id" element={
              <Private><TranslateDetail /></Private>
            } />

            <Route path="/lesson/:id" element={
              <Private><LessonView /></Private>
            } />
            <Route path="/lesson/create" element={
              <Private><LessonCreate /></Private>
            } />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

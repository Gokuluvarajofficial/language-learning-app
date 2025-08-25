// src/pages/LessonsList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function LessonsList() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        const { data } = await api.get("/api/lesson/");
        // support both array and paginated {results: []}
        const arr = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        setItems(arr);
        setStatus("ready");
      } catch (e) {
        const d = e?.response?.data;
        let msg = "Failed to load lessons";
        if (d) msg = typeof d === "string" ? d : d.detail || JSON.stringify(d);
        else if (e?.message) msg = `Network error: ${e.message}`;
        setErr(msg);
        setStatus("error");
      }
    })();
  }, []);

  if (status === "loading") return <p>Loading…</p>;
  if (status === "error") return <p className="error">{err}</p>;

  if (items.length === 0) {
    return (
      <div className="card">
        <h2>Lessons</h2>
        <p>No lessons found.</p>
        <Link className="btn" to="/lesson/create">Create Lesson</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2>Lessons ({items.length})</h2>
        <Link className="btn" to="/lesson/create">Create Lesson</Link>
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
        gap:16,
        marginTop:16
      }}>
        {items
          .slice()
          .sort((a,b) => (a.id > b.id ? -1 : 1)) // newest first
          .map(lesson => (
          <div key={lesson.id} className="card" style={{padding:16}}>
            <h3 style={{marginTop:0}}>
              #{lesson.id} — {lesson.title || "Untitled"}
            </h3>
            {lesson.lesson && <p style={{opacity:.8}}>Topic: {lesson.lesson}</p>}
            {Array.isArray(lesson.translate) && (
              <small style={{opacity:.8}}>
                {lesson.translate.length} translate item(s)
              </small>
            )}
            <div style={{marginTop:12}}>
              <Link className="btn" to={`/lesson/${lesson.id}`}>Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

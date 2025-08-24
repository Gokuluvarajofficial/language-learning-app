import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

const API_HOST = "https://translate.zenvicsoft.com"; // for relative media paths
const placeholder =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'>
      <rect width='100%' height='100%' fill='#0b1220'/>
      <text x='50%' y='50%' fill='#94a3b8' font-size='14' text-anchor='middle' dominant-baseline='middle'>
        No image
      </text>
    </svg>`
  );

function resolveImage(url) {
  if (!url) return placeholder;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function LessonView() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [status, setStatus] = useState("loading");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/lesson/${id}/`);
        setLesson(data);
        setStatus("ready");
      } catch (e) {
        setErr(e?.response?.data?.detail || "Failed to load lesson");
        setStatus("error");
      }
    })();
  }, [id]);

  if (status === "loading") return <p>Loading…</p>;
  if (status === "error") return <p className="error">{err}</p>;

  return (
    <div className="card">
      <h2>Lesson #{lesson.id}: {lesson.title}</h2>
      <p>Lesson: {lesson.lesson}</p>

      <div className="grid">
        {lesson.translate?.map((t) => (
          <div key={t.id} className="tile">
            <img src={resolveImage(t.image)} alt={t.known_word || t.english || "Translate"} />
            <h3>{(t.known_word || t.english)} → {(t.target_word || t.tamil)}</h3>
            <p><b>EN:</b> {t.known_sentence || t.english_sentence}</p>
            <p><b>TA:</b> {t.target_sentence || t.tamil_sentence}</p>
            <Link to={`/translate/${t.id}`} className="btn">Open</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

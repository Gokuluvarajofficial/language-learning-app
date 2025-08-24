import { useEffect, useState } from "react";
import api from "../api/client";
import axios from "axios";
import { Link } from "react-router-dom";

const DIRECT_BASE = "https://translate.zenvicsoft.com";

async function getListViaProxy() {
  const { data } = await api.get("/api/translate/");
  return data;
}

async function getListViaDirect() {
  const token = localStorage.getItem("token") || "";
  const { data } = await axios.get(`${DIRECT_BASE}/api/translate/`, {
    headers: { Authorization: token ? `Token ${token}` : undefined, Accept: "application/json" },
    withCredentials: false,
  });
  return data;
}

async function getLesson1Translates() {
  const { data } = await api.get("/api/lesson/1/");
  return Array.isArray(data?.translate) ? data.translate : [];
}

async function getDetail(id) {
  const { data } = await api.get(`/api/translate/${id}/`);
  return data;
}

export default function TranslateList() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // 1) Normal list (proxy)
        const data = await getListViaProxy();
        setItems(data);
        setStatus("ready");
        return;
      } catch (e1) {
        // continue
      }

      try {
        // 2) Direct absolute URL
        const data = await getListViaDirect();
        setItems(data);
        setStatus("ready");
        return;
      } catch (e2) {
        // continue
      }

      try {
        // 3) Fallback: lesson #1 + detail probes
        const lessonItems = await getLesson1Translates();

        // Probe a small ID window to enrich the list (skip not-found)
        const idsToProbe = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20
        const probs = await Promise.allSettled(idsToProbe.map((id) => getDetail(id)));
        const detailItems = probs
          .filter((p) => p.status === "fulfilled" && p.value && p.value.id)
          .map((p) => p.value);

        // merge by id (avoid duplicates)
        const map = new Map();
        [...lessonItems, ...detailItems].forEach((it) => map.set(it.id, it));
        const merged = Array.from(map.values());

        if (merged.length === 0) {
          throw new Error("Unable to load translates via fallbacks.");
        }
        setItems(merged);
        setStatus("ready");
      } catch (e3) {
        setErrMsg(
          e3?.response?.data?.detail
            ? e3.response.data.detail
            : e3?.message
            ? `Network error: ${e3.message}`
            : "Failed to load"
        );
        setStatus("error");
      }
    })();
  }, []);

  if (status === "loading") return <p>Loading…</p>;
  if (status === "error") return <p className="error">{errMsg}</p>;

  return (
    <div className="grid">
      {items.map((t) => (
        <div key={t.id} className="tile">
          <img src={t.image} alt={t.english || t.known_word || `Translate ${t.id}`} />
          <h3>
            {(t.english || t.known_word) ?? ""} — {(t.tamil || t.target_word) ?? ""}
          </h3>
          <p><strong>EN:</strong> {t.english_sentence || t.known_sentence}</p>
          <p><strong>TA:</strong> {t.tamil_sentence || t.target_sentence}</p>
          {t.hindi_sentence && <p><strong>HI:</strong> {t.hindi_sentence}</p>}
          {t.telugu_sentence && <p><strong>TE:</strong> {t.telugu_sentence}</p>}
          {t.malayalam_sentence && <p><strong>ML:</strong> {t.malayalam_sentence}</p>}
          <Link to={`/translate/${t.id}`} className="btn">View Detail</Link>
        </div>
      ))}
    </div>
  );
}

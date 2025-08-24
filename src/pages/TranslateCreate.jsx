// src/pages/TranslateCreate.jsx
import { useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const empty = {
  english: "", tamil: "", hindi: "", telugu: "", malayalam: "",
  english_sentence: "", tamil_sentence: "", hindi_sentence: "",
  telugu_sentence: "", malayalam_sentence: ""
};

export default function TranslateCreate() {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      if (file) fd.append("image", file);

      // append all fields
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      // POST to create translate
      await api.post("/api/translate/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // go back to list
      navigate("/translate");
    } catch (err) {
      const d = err?.response?.data;
      let msg = "Create failed";
      if (d) {
        if (typeof d === "string") msg = d;
        else if (d.detail) msg = d.detail;
        else msg = Object.entries(d)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
      } else if (err?.message) {
        msg = `Network error: ${err.message}`;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2>Create Translate</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Image
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0] || null)} />
        </label>

        <div className="grid2">
          <label>English <input name="english" value={form.english} onChange={onChange} /></label>
          <label>Tamil <input name="tamil" value={form.tamil} onChange={onChange} /></label>
          <label>Hindi <input name="hindi" value={form.hindi} onChange={onChange} /></label>
          <label>Telugu <input name="telugu" value={form.telugu} onChange={onChange} /></label>
          <label>Malayalam <input name="malayalam" value={form.malayalam} onChange={onChange} /></label>
        </div>

        <label>English sentence
          <textarea name="english_sentence" value={form.english_sentence} onChange={onChange} />
        </label>
        <label>Tamil sentence
          <textarea name="tamil_sentence" value={form.tamil_sentence} onChange={onChange} />
        </label>
        <label>Hindi sentence
          <textarea name="hindi_sentence" value={form.hindi_sentence} onChange={onChange} />
        </label>
        <label>Telugu sentence
          <textarea name="telugu_sentence" value={form.telugu_sentence} onChange={onChange} />
        </label>
        <label>Malayalam sentence
          <textarea name="malayalam_sentence" value={form.malayalam_sentence} onChange={onChange} />
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? "Creating..." : "Create"}</button>
      </form>
    </div>
  );
}

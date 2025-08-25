// src/pages/TranslateDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function TranslateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    english: "",
    tamil: "",
    hindi: "",
    telugu: "",
    malayalam: "",
    english_sentence: "",
    tamil_sentence: "",
    hindi_sentence: "",
    telugu_sentence: "",
    malayalam_sentence: "",
  });
  const [imageFile, setImageFile] = useState(null);

  // Preview image (picked file or current item)
  const imgSrc = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (!item?.image) return "";
    const src = String(item.image || "");
    return src.startsWith("http") ? src : src; // leave relative paths as-is (proxy handles them)
  }, [item, imageFile]);

  // Load the record
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatus("loading");
        const { data } = await api.get(`/api/translate/${id}/`);
        if (!alive) return;

        setItem(data);
        // Map backend to our form fields (fallbacks included)
        setForm({
          english: data.english ?? data.known_word ?? "",
          tamil: data.tamil ?? data.target_word ?? "",
          hindi: data.hindi ?? "",
          telugu: data.telugu ?? "",
          malayalam: data.malayalam ?? "",
          english_sentence: data.english_sentence ?? "",
          tamil_sentence: data.tamil_sentence ?? "",
          hindi_sentence: data.hindi_sentence ?? "",
          telugu_sentence: data.telugu_sentence ?? "",
          malayalam_sentence: data.malayalam_sentence ?? "",
        });

        setStatus("ready");
      } catch (e) {
        setErr(flattenErr(e, "Failed to load"));
        setStatus("error");
      }
    })();

    return () => {
      alive = false;
      if (imageFile) URL.revokeObjectURL(imageFile);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const flattenErr = (err, fallback = "Error") => {
    const d = err?.response?.data;
    if (d) {
      if (typeof d === "string") return d;
      if (d.detail) return d.detail;
      return Object.entries(d)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join(" | ");
    }
    return err?.message ? `Network error: ${err.message}` : fallback;
  };

  // Always send multipart/form-data (many DRF update views expect it)
  const save = async () => {
    setErr("");
    setOk("");
    const url = `/api/translate/${id}/`;

    const fd = new FormData();
    fd.append("english", form.english ?? "");
    fd.append("tamil", form.tamil ?? "");
    fd.append("hindi", form.hindi ?? "");
    fd.append("telugu", form.telugu ?? "");
    fd.append("malayalam", form.malayalam ?? "");
    fd.append("english_sentence", form.english_sentence ?? "");
    fd.append("tamil_sentence", form.tamil_sentence ?? "");
    fd.append("hindi_sentence", form.hindi_sentence ?? "");
    fd.append("telugu_sentence", form.telugu_sentence ?? "");
    fd.append("malayalam_sentence", form.malayalam_sentence ?? "");
    if (imageFile) fd.append("image", imageFile);

    try {
      // Use PATCH (partial update). Do not manually set Content-Type.
      await api.patch(url, fd);

      const { data } = await api.get(url); // refresh
      setItem(data);
      setOk("Updated successfully.");
      setEdit(false);
      setImageFile(null);
    } catch (e) {
      setErr(flattenErr(e, "Update failed"));
    }
  };

  // Optional delete (enable if API supports DELETE)
  // const removeItem = async () => {
  //   if (!confirm("Delete this item?")) return;
  //   try {
  //     await api.delete(`/api/translate/${id}/`);
  //     navigate("/translate");
  //   } catch (e) {
  //     setErr(flattenErr(e, "Delete failed"));
  //   }
  // };

  if (status === "loading") return <p>Loading…</p>;
  if (status === "error") return <p className="error">{err}</p>;
  if (!item) return null;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Translate #{item.id}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setEdit((v) => !v)}>
            {edit ? "Cancel" : "Edit"}
          </button>
          {/* <button className="btn danger" onClick={removeItem}>Delete</button> */}
        </div>
      </div>

      {ok && <p className="success" style={{ marginTop: 8 }}>{ok}</p>}
      {err && <p className="error" style={{ marginTop: 8 }}>{err}</p>}

      <div style={{ marginTop: 16 }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.english || item.known_word || "Translate"}
            style={{ width: "100%", maxWidth: 420, borderRadius: 8 }}
          />
        ) : null}
      </div>

      {!edit ? (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>
            {(item.english || item.known_word || "").trim()} — {(item.tamil || item.target_word || "").trim()}
          </h3>
          <p><strong>EN:</strong> {item.english_sentence || "-"}</p>
          <p><strong>TA:</strong> {item.tamil_sentence || "-"}</p>
          <p><strong>HI:</strong> {item.hindi_sentence || "-"}</p>
          <p><strong>TE:</strong> {item.telugu_sentence || "-"}</p>
          <p><strong>ML:</strong> {item.malayalam_sentence || "-"}</p>
        </section>
      ) : (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          style={{ marginTop: 16 }}
        >
          <div className="grid-2">
            <label>
              English
              <input
                name="english"
                value={form.english}
                onChange={onChange}
                placeholder="Dog"
              />
            </label>
            <label>
              Tamil
              <input
                name="tamil"
                value={form.tamil}
                onChange={onChange}
                placeholder="நாய்"
              />
            </label>
          </div>

          <div className="grid-3">
            <label>
              Hindi
              <input name="hindi" value={form.hindi} onChange={onChange} />
            </label>
            <label>
              Telugu
              <input name="telugu" value={form.telugu} onChange={onChange} />
            </label>
            <label>
              Malayalam
              <input name="malayalam" value={form.malayalam} onChange={onChange} />
            </label>
          </div>

          <label>
            Image (optional)
            <input type="file" accept="image/*" onChange={onPickImage} />
          </label>

          <label>
            English sentence
            <textarea
              name="english_sentence"
              rows={2}
              value={form.english_sentence}
              onChange={onChange}
            />
          </label>
          <label>
            Tamil sentence
            <textarea
              name="tamil_sentence"
              rows={2}
              value={form.tamil_sentence}
              onChange={onChange}
            />
          </label>
          <label>
            Hindi sentence
            <textarea
              name="hindi_sentence"
              rows={2}
              value={form.hindi_sentence}
              onChange={onChange}
            />
          </label>
          <label>
            Telugu sentence
            <textarea
              name="telugu_sentence"
              rows={2}
              value={form.telugu_sentence}
              onChange={onChange}
            />
          </label>
          <label>
            Malayalam sentence
            <textarea
              name="malayalam_sentence"
              rows={2}
              value={form.malayalam_sentence}
              onChange={onChange}
            />
          </label>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button type="submit" className="btn primary">Save Changes</button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setEdit(false);
                setImageFile(null);
                setOk("");
                setErr("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

export default function TranslateDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get(`/api/translate/${id}/`);
        setItem(data);
        setStatus("ready");
      } catch (e) {
        setStatus("error");
      }
    };
    run();
  }, [id]);

  if (status === "loading") return <p>Loading…</p>;
  if (status === "error") return <p className="error">Not found</p>;

  return (
    <div className="card">
      <h2>Translate #{item.id}</h2>
      <img className="hero" src={item.image} alt={item.english}/>
      <ul className="kv">
        <li><b>English:</b> {item.english}</li>
        <li><b>Tamil:</b> {item.tamil}</li>
        <li><b>Hindi:</b> {item.hindi}</li>
        <li><b>Telugu:</b> {item.telugu}</li>
        <li><b>Malayalam:</b> {item.malayalam}</li>
      </ul>
      <div className="sentences">
        <p><b>EN:</b> {item.english_sentence}</p>
        <p><b>TA:</b> {item.tamil_sentence}</p>
        <p><b>HI:</b> {item.hindi_sentence}</p>
        <p><b>TE:</b> {item.telugu_sentence}</p>
        <p><b>ML:</b> {item.malayalam_sentence}</p>
      </div>
    </div>
  );
}

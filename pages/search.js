import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (router.query.q) {
      setQ(router.query.q);
      doSearch(router.query.q);
    }
  }, [router.query.q]);

  async function doSearch(term) {
    setIsLoading(true);
    setError("");
    try {
      const url = `/api/v1/posts${term ? `?q=${encodeURIComponent(term)}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha na busca");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <Head>
        <title>Buscar — forum.dev</title>
      </Head>

      <main style={styles.main}>
        <h1 style={styles.title}>Buscar posts</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Pesquisar por título ou conteúdo"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={styles.input}
          />
          <button style={styles.button}>Buscar</button>
        </form>

        {isLoading && <p>Buscando...</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.results}>
          {results.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              style={styles.resultItem}
            >
              <h3>{post.title}</h3>
              <p>{post.content.slice(0, 140)}...</p>
              <small>por {post.author}</small>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

const styles = {
  main: { maxWidth: "960px", margin: "0 auto", padding: "24px" },
  title: { color: "#38bdf8" },
  form: { display: "flex", gap: "8px", margin: "16px 0" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#020617",
    color: "#e5e7eb",
  },
  button: {
    padding: "12px 16px",
    borderRadius: "8px",
    background: "#38bdf8",
    border: "none",
    color: "#020617",
  },
  results: { marginTop: "18px", display: "grid", gap: "12px" },
  resultItem: {
    padding: "12px",
    background: "#0f172a",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#e5e7eb",
  },
  error: { color: "#fca5a5" },
};

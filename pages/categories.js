import { getStoredUser, getToken } from "lib/auth";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [user, setUser] = useState(null);

  const canManageCategories =
    user && ["admin", "moderator"].includes(user.role);

  useEffect(() => {
    setUser(getStoredUser());
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await fetch("/api/v1/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao carregar categorias.");
      }

      setCategories(data);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setStatusMessage("");

    if (!canManageCategories) {
      setStatusMessage("Apenas moderadores podem criar categorias.");
      return;
    }

    try {
      const response = await fetch("/api/v1/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Falha ao criar categoria.");
      }

      setCategories((current) =>
        [...current, body].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      setDescription("");
      setStatusMessage("Categoria criada com sucesso!");
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  return (
    <>
      <Head>
        <title>Categorias — forum.dev</title>
      </Head>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Categorias</h1>
            <p style={styles.subtitle}>Navegue pelos assuntos da comunidade.</p>
          </div>
          <Link href="/posts" style={styles.linkButton}>
            Ver posts
          </Link>
        </div>

        <section style={canManageCategories ? styles.grid : styles.singleGrid}>
          <article style={styles.categoriesCard}>
            <h2 style={styles.sectionTitle}>Todas as categorias</h2>
            <div style={styles.categoriesList}>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/posts?category=${encodeURIComponent(category.name)}`}
                  style={styles.categoryItem}
                >
                  <strong>{category.name}</strong>
                  <p>{category.description}</p>
                </Link>
              ))}
            </div>
          </article>

          {canManageCategories && (
            <article style={styles.createCard}>
              <h2 style={styles.sectionTitle}>Criar nova categoria</h2>
              <form onSubmit={handleCreate} style={styles.form}>
                <label style={styles.label}>
                  Nome
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    style={styles.input}
                    minLength={3}
                    required
                  />
                </label>

                <label style={styles.label}>
                  Descrição
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    style={{ ...styles.input, minHeight: "120px" }}
                    minLength={10}
                    required
                  />
                </label>

                <button type="submit" style={styles.button}>
                  Criar categoria
                </button>
              </form>
            </article>
          )}
        </section>

        {statusMessage && <p style={styles.status}>{statusMessage}</p>}
      </main>
    </>
  );
}

const styles = {
  main: { maxWidth: "1200px", margin: "0 auto", padding: "24px 0" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },
  title: { margin: 0, fontSize: "2.2rem", color: "#38bdf8" },
  subtitle: { margin: "10px 0 0", color: "#94a3b8", maxWidth: "680px" },
  linkButton: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    textDecoration: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 1fr)",
    gap: "24px",
  },
  singleGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "24px" },
  categoriesCard: {
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },
  createCard: {
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },
  sectionTitle: {
    margin: "0 0 20px",
    color: "#e2e8f0",
    fontSize: "1.4rem",
  },
  categoriesList: { display: "grid", gap: "14px" },
  categoryItem: {
    display: "block",
    padding: "18px",
    borderRadius: "16px",
    border: "1px solid #334155",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    textDecoration: "none",
  },
  form: { display: "grid", gap: "18px" },
  label: {
    display: "grid",
    gap: "10px",
    color: "#cbd5e1",
    fontSize: "0.95rem",
  },
  input: {
    width: "100%",
    backgroundColor: "#020617",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "14px 16px",
  },
  button: {
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#38bdf8",
    color: "#020617",
    cursor: "pointer",
  },
  status: { marginTop: "16px", color: "#a5f3fc" },
};

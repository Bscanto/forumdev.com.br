import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/categories")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || "Erro ao carregar categorias.");
        }
        setCategories(body);
      })
      .catch(() => {
        setCategories([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>forum.dev — Comunidade de Desenvolvedores</title>
        <meta
          name="description"
          content="forum.dev é um fórum online para desenvolvedores compartilharem conhecimento."
        />
      </Head>

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.hero}>
            <p style={styles.overline}>Comunidade de desenvolvedores</p>
            <h1 style={styles.title}>
              Aprenda, compartilhe e cresça em tecnologia.
            </h1>
            <p style={styles.subtitle}>
              forum.dev reúne posts, comentários e categorias dinâmicas para
              você criar conteúdo e trocar conhecimento.
            </p>

            <div style={styles.actions}>
              <Link href="/posts" style={styles.primaryButton}>
                Ver posts
              </Link>
              <Link href="/register" style={styles.secondaryButton}>
                Criar conta
              </Link>
            </div>
          </div>

          <aside style={styles.heroCard}>
            <h2 style={styles.heroCardTitle}>Comece agora</h2>
            <p style={styles.heroCardText}>
              Registre-se para publicar posts, comentar, criar categorias e
              acompanhar sua jornada na comunidade.
            </p>
            <Link href="/categories" style={styles.linkButton}>
              Explorar categorias
            </Link>
          </aside>
        </header>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>💬 Categorias em destaque</h2>
            <Link href="/categories" style={styles.textLink}>
              Ver todas
            </Link>
          </div>

          {isLoading ? (
            <p>Carregando categorias...</p>
          ) : (
            <ul style={styles.list}>
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </ul>
          )}
        </section>

        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} forum.dev</p>
        </footer>
      </main>
    </>
  );
}

function CategoryCard({ category }) {
  return (
    <li style={styles.card}>
      <Link
        href={`/posts?category=${encodeURIComponent(category.name)}`}
        style={styles.cardLink}
      >
        <h3 style={styles.cardTitle}>{category.name}</h3>
        <p style={styles.cardDescription}>{category.description}</p>
      </Link>
    </li>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "#020617",
    color: "#e5e7eb",
    padding: "40px 20px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "1.65fr 1fr",
    gap: "24px",
    maxWidth: "1120px",
    margin: "0 auto 48px",
    alignItems: "start",
  },
  hero: {
    display: "grid",
    gap: "22px",
  },
  overline: {
    color: "#38bdf8",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: "0.85rem",
    margin: 0,
  },
  title: {
    fontSize: "3rem",
    lineHeight: 1.05,
    margin: 0,
    color: "#e5e7eb",
  },
  subtitle: {
    maxWidth: "680px",
    color: "#94a3b8",
    fontSize: "1.05rem",
    lineHeight: 1.8,
    margin: 0,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
  },
  primaryButton: {
    padding: "14px 24px",
    borderRadius: "14px",
    backgroundColor: "#38bdf8",
    color: "#020617",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    padding: "14px 24px",
    borderRadius: "14px",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    backgroundColor: "transparent",
    textDecoration: "none",
    fontWeight: 600,
  },
  heroCard: {
    padding: "28px",
    borderRadius: "24px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },
  heroCardTitle: {
    margin: 0,
    fontSize: "1.6rem",
    color: "#e5e7eb",
  },
  heroCardText: {
    margin: "18px 0 24px",
    color: "#94a3b8",
    lineHeight: 1.8,
  },
  linkButton: {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    textDecoration: "none",
  },
  section: {
    maxWidth: "1120px",
    margin: "0 auto",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "1.6rem",
    margin: 0,
  },
  textLink: {
    color: "#38bdf8",
    textDecoration: "none",
  },
  list: {
    listStyle: "none",
    padding: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#020617",
    padding: "24px",
    borderRadius: "18px",
    border: "1px solid #1e293b",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },
  cardLink: {
    display: "block",
    color: "inherit",
    textDecoration: "none",
  },
  cardTitle: {
    fontSize: "1.25rem",
    marginBottom: "12px",
    color: "#e5e7eb",
  },
  cardDescription: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    lineHeight: 1.7,
  },
  footer: {
    marginTop: "64px",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#64748b",
  },
};

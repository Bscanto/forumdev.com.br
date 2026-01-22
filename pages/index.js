import Head from "next/head";
import Link from "next/link";

export default function Home() {
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
        {/* HEADER */}
        <header style={styles.header}>
          <h1 style={styles.title}>forum.dev</h1>
          <p style={styles.subtitle}>
            A comunidade onde desenvolvedores aprendem e compartilham 🚀
          </p>

          <div style={styles.actions}>
            <Link href="/login" style={styles.primaryButton}>
              Entrar
            </Link>
            <Link href="/register" style={styles.secondaryButton}>
              Criar conta
            </Link>
          </div>
        </header>

        {/* CATEGORIES */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>💬 Categorias</h2>

          <ul style={styles.list}>
            <CategoryCard
              title="JavaScript"
              description="Dúvidas, dicas e novidades sobre JS."
            />

            <CategoryCard
              title="Backend"
              description="Node.js, APIs, bancos de dados e arquitetura."
            />

            <CategoryCard
              title="Frontend"
              description="React, Next.js, CSS e UI/UX."
            />

            <CategoryCard
              title="Carreira"
              description="Vagas, freelas e crescimento profissional."
            />
          </ul>
        </section>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} forum.dev</p>
        </footer>
      </main>
    </>
  );
}

/* COMPONENT */
function CategoryCard({ title, description }) {
  return (
    <li style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDescription}>{description}</p>
    </li>
  );
}

/* STYLES */
const styles = {
  main: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #020617 0%, #020617 40%, #020617 100%)",
    color: "#e5e7eb",
    padding: "40px 20px",
    fontFamily: "Inter, Arial, sans-serif",
  },

  header: {
    maxWidth: "900px",
    margin: "0 auto 60px",
    textAlign: "center",
  },

  title: {
    fontSize: "3.2rem",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#38bdf8",
  },

  subtitle: {
    fontSize: "1.2rem",
    color: "#94a3b8",
    marginBottom: "30px",
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },

  primaryButton: {
    padding: "12px 22px",
    backgroundColor: "#38bdf8",
    color: "#020617",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
  },

  secondaryButton: {
    padding: "12px 22px",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
  },

  section: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  sectionTitle: {
    fontSize: "1.6rem",
    marginBottom: "24px",
  },

  list: {
    listStyle: "none",
    padding: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: "#020617",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  cardTitle: {
    fontSize: "1.2rem",
    marginBottom: "8px",
    color: "#e5e7eb",
  },

  cardDescription: {
    fontSize: "0.95rem",
    color: "#94a3b8",
  },

  footer: {
    marginTop: "80px",
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#64748b",
  },
};

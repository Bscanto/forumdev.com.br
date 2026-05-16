import { clearAuthData, getStoredUser, getToken } from "lib/auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Não autorizado");
        }
        const body = await response.json();
        setUser(body.user);
      })
      .catch((err) => {
        setError(err.message || "Não foi possível carregar o perfil.");
        clearAuthData();
        router.replace("/login");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return (
      <main style={styles.main}>
        <p>Carregando perfil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.main}>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Perfil — forum.dev</title>
      </Head>

      <main style={styles.main}>
        <section style={styles.card}>
          <h1 style={styles.title}>Meu perfil</h1>
          <p style={styles.subtitle}>
            Detalhes da sua conta e informações de acesso.
          </p>

          <div style={styles.profileInfo}>
            <div style={styles.row}>
              <span style={styles.label}>Nome</span>
              <strong>{user?.name}</strong>
            </div>

            <div style={styles.row}>
              <span style={styles.label}>E-mail</span>
              <strong>{user?.email}</strong>
            </div>

            <div style={styles.row}>
              <span style={styles.label}>Autenticado</span>
              <strong>Sim</strong>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const styles = {
  main: {
    maxWidth: "880px",
    margin: "0 auto",
    padding: "24px 0",
  },
  card: {
    padding: "32px",
    borderRadius: "24px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    color: "#38bdf8",
  },
  subtitle: {
    margin: "12px 0 24px",
    color: "#94a3b8",
    lineHeight: 1.8,
  },
  profileInfo: {
    display: "grid",
    gap: "18px",
  },
  row: {
    display: "grid",
    gap: "6px",
  },
  label: {
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "0.78rem",
    color: "#94a3b8",
  },
};

import { setAuthData } from "lib/auth";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("forumdev_token");
    if (token) {
      router.replace("/posts");
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || "Falha ao registrar.");
      }

      setAuthData({ token: body.token, user: body.user });
      router.push("/posts");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <Head>
        <title>Criar conta — forum.dev</title>
      </Head>

      <main style={styles.main}>
        <section style={styles.card}>
          <h1 style={styles.title}>Criar conta</h1>
          <p style={styles.subtitle}>
            Cadastre-se e comece a compartilhar perguntas e conhecimentos.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Nome completo
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                style={styles.input}
                placeholder="Seu nome"
                required
              />
            </label>

            <label style={styles.label}>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={styles.input}
                placeholder="seu@email.com"
                required
              />
            </label>

            <label style={styles.label}>
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={styles.input}
                placeholder="********"
                required
              />
            </label>

            <button type="submit" style={styles.button}>
              Criar conta
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}

          <p style={styles.footerText}>
            Já tem conta? <Link href="/login">Entrar</Link>
          </p>
          <p style={styles.footerText}>
            <Link href="/">Voltar para a página inicial</Link>
          </p>
        </section>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "#020617",
    color: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "18px",
    padding: "32px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.35)",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    color: "#38bdf8",
  },
  subtitle: {
    marginTop: "12px",
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  form: {
    marginTop: "28px",
    display: "grid",
    gap: "18px",
  },
  label: {
    display: "grid",
    gap: "12px",
    color: "#cbd5e1",
    fontSize: "0.95rem",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #334155",
    backgroundColor: "#020617",
    color: "#f8fafc",
  },
  button: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#38bdf8",
    color: "#020617",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    marginTop: "16px",
    color: "#a5f3fc",
  },
  footerText: {
    marginTop: "18px",
    color: "#94a3b8",
    fontSize: "0.95rem",
  },
};

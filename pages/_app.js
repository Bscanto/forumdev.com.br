import { clearAuthData, getStoredUser, isAuthenticated } from "lib/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const protectedRoutes = ["/profile"];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    setUser(getStoredUser());
  }, [router.pathname]);

  useEffect(() => {
    if (!protectedRoutes.some((route) => router.pathname.startsWith(route))) {
      return;
    }
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router.pathname]);

  function handleLogout() {
    clearAuthData();
    setUser(null);
    router.push("/login");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          forum.dev
        </Link>

        <nav style={styles.nav}>
          <Link href="/posts" style={styles.link}>
            Posts
          </Link>
          <Link href="/categories" style={styles.link}>
            Categorias
          </Link>
          {user ? (
            <>
              <Link href="/profile" style={styles.link}>
                Perfil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutButton}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={styles.link}>
                Entrar
              </Link>
              <Link href="/register" style={styles.button}>
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </header>

      <main style={styles.main}>
        <Component {...pageProps} user={user} />
      </main>

      <style jsx global>{`
        html {
          box-sizing: border-box;
        }
        *,
        *::before,
        *::after {
          box-sizing: inherit;
        }
        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: #020617;
          color: #e5e7eb;
        }
        button {
          font: inherit;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #1e293b",
    backgroundColor: "#020617",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: "1.35rem",
    fontWeight: 700,
    color: "#38bdf8",
    textDecoration: "none",
  },
  nav: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  link: {
    color: "#e5e7eb",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    transition: "background-color 0.2s ease",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    backgroundColor: "transparent",
    cursor: "pointer",
    textDecoration: "none",
  },
  logoutButton: {
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid #ef4444",
    backgroundColor: "transparent",
    color: "#ef4444",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    padding: "24px",
  },
};

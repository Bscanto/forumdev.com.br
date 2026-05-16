import { getToken } from "lib/auth";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setStatus("");
    try {
      const token = getToken();
      const res = await fetch("/api/v1/admin/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Não autorizado");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setStatus(err.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(id, role) {
    setStatus("");
    try {
      const token = getToken();
      const res = await fetch(`/api/v1/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Falha ao alterar role");
      }
      const updated = await res.json();
      setUsers((current) =>
        current.map((u) => (u.id === updated.id ? updated : u)),
      );
      setStatus("Role atualizada com sucesso.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <>
      <Head>
        <title>Admin — Usuários — forum.dev</title>
      </Head>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Painel de administração — Usuários</h1>
          <Link href="/" style={styles.linkButton}>
            Voltar
          </Link>
        </div>

        {loading ? (
          <p>Carregando usuários...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Role</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {status && <p style={styles.status}>{status}</p>}
      </main>
    </>
  );
}

const styles = {
  main: { maxWidth: "980px", margin: "0 auto", padding: "24px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  title: { color: "#38bdf8", margin: 0 },
  linkButton: { color: "#38bdf8", textDecoration: "none" },
  table: { width: "100%", borderCollapse: "collapse" },
  status: { marginTop: "12px", color: "#a5f3fc" },
};

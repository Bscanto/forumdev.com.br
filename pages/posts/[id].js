import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PostDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [commentStatus, setCommentStatus] = useState("");

  useEffect(() => {
    const storedUser = window.localStorage.getItem("forumdev_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    loadPost();
    loadComments();
  }, [id]);

  async function loadPost() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/posts/${id}`);
      if (!response.ok) {
        throw new Error("Post não encontrado.");
      }
      const data = await response.json();
      setPost(data);
      setTitle(data.title);
      setContent(data.content);
      setAuthor(data.author);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadComments() {
    try {
      const response = await fetch(
        `/api/v1/comments?postId=${encodeURIComponent(id)}`,
      );
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Deseja realmente excluir este post?")) {
      return;
    }
    try {
      const token = window.localStorage.getItem("forumdev_token");
      const response = await fetch(`/api/v1/posts/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status !== 204) {
        throw new Error("Falha ao excluir o post.");
      }
      router.push("/posts");
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setStatusMessage("");

    try {
      const response = await fetch(`/api/v1/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, author }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || "Falha ao atualizar o post.");
      }

      const updated = await response.json();
      setPost(updated);
      setEditing(false);
      setStatusMessage("Post atualizado com sucesso!");
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function handleSubmitComment(event) {
    event.preventDefault();
    setCommentStatus("");

    if (!commentText.trim()) {
      setCommentStatus("Escreva um comentário antes de enviar.");
      return;
    }

    const token = window.localStorage.getItem("forumdev_token");
    if (!token) {
      setCommentStatus("Você precisa estar logado para comentar.");
      return;
    }

    try {
      const response = await fetch("/api/v1/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id, content: commentText }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || "Falha ao enviar comentário.");
      }

      setCommentText("");
      setCommentStatus("Comentário publicado com sucesso!");
      await loadComments();
    } catch (error) {
      setCommentStatus(error.message);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("Deseja realmente excluir este comentário?")) return;
    try {
      const token = window.localStorage.getItem("forumdev_token");
      const response = await fetch(`/api/v1/comments?id=${commentId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status !== 204) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Falha ao excluir comentário.");
      }
      await loadComments();
    } catch (error) {
      setCommentStatus(error.message);
    }
  }

  if (isLoading) {
    return (
      <main style={styles.main}>
        <p>Carregando post...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.main}>
        <p>{error}</p>
        <Link href="/posts" style={styles.linkButton}>
          Voltar para posts
        </Link>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{post?.title || "Post"} — forum.dev</title>
      </Head>

      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.actionsRow}>
            <Link href="/posts" style={styles.linkButton}>
              Voltar para posts
            </Link>
            {(user && (user.id === post.owner_id || ["admin", "moderator"].includes(user.role))) && (
              <button style={styles.deleteButton} onClick={handleDelete}>
                Excluir post
              </button>
            )}
          </div>

          <section style={styles.detailCard}>
            <div style={styles.detailHeader}>
              <div>
                <h1 style={styles.title}>{post.title}</h1>
                <div style={styles.metaRow}>
                  <span style={styles.author}>por {post.author}</span>
                  {post.category && (
                    <span style={styles.categoryTag}>{post.category}</span>
                  )}
                </div>
              </div>
              <div>
                {(user && (user.id === post.owner_id || ["admin", "moderator"].includes(user.role))) && (
                  <>
                    <button
                      onClick={() => setEditing((current) => !current)}
                      style={styles.editButton}
                    >
                      {editing ? "Cancelar edição" : "Editar post"}
                    </button>
                    <button style={styles.deleteButton} onClick={handleDelete}>
                      Excluir post
                    </button>
                  </>
                )}
              </div>
            </div>

            <p style={styles.timestamp}>
              Criado em {new Date(post.created_at).toLocaleString()}
            </p>

            <p style={styles.content}>{post.content}</p>

            {/** edição/controlos estão no header quando permitidos */}

            {editing && (
              <form onSubmit={handleSave} style={styles.form}>
                <label style={styles.label}>
                  Título
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Conteúdo
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    style={{ ...styles.input, minHeight: "130px" }}
                  />
                </label>

                <label style={styles.label}>
                  Autor
                  <input
                    type="text"
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    style={styles.input}
                  />
                </label>

                <button type="submit" style={styles.saveButton}>
                  Salvar alterações
                </button>
              </form>
            )}

            {statusMessage && <p style={styles.status}>{statusMessage}</p>}
          </section>

          <section style={styles.commentsCard}>
            <h2 style={styles.sectionTitle}>Comentários</h2>

            {user ? (
              <form onSubmit={handleSubmitComment} style={styles.form}>
                <label style={styles.label}>
                  Escreva um comentário
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    style={{ ...styles.input, minHeight: "120px" }}
                    placeholder="Compartilhe sua opinião"
                  />
                </label>
                <button type="submit" style={styles.button}>
                  Enviar comentário
                </button>
                {commentStatus && <p style={styles.status}>{commentStatus}</p>}
              </form>
            ) : (
              <p style={styles.infoText}>
                <Link href="/login" style={styles.actionLink}>
                  Faça login
                </Link>{" "}
                para escrever comentários.
              </p>
            )}

            {comments.length === 0 ? (
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            ) : (
              <div style={styles.commentList}>
                {comments.map((comment) => (
                  <article key={comment.id} style={styles.commentItem}>
                    <div style={styles.commentHeader}>
                      <strong>{comment.author || "Anônimo"}</strong>
                      <div>
                        <span>
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                        {(user && (user.id === comment.owner_id || ["admin", "moderator"].includes(user.role))) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{ ...styles.deleteButton, marginLeft: "10px" }}
                          >
                            Apagar
                          </button>
                        )}
                      </div>
                    </div>
                    <p>{comment.content}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "#020617",
    color: "#e5e7eb",
    padding: "40px 24px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  container: {
    maxWidth: "960px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
  },
  actionsRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  linkButton: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid #38bdf8",
    backgroundColor: "transparent",
    color: "#38bdf8",
    textDecoration: "none",
    fontWeight: 600,
  },
  deleteButton: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
  },
  detailCard: {
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "2.2rem",
    color: "#38bdf8",
  },
  author: {
    color: "#94a3b8",
    fontSize: "0.95rem",
  },
  timestamp: {
    margin: "16px 0",
    color: "#94a3b8",
  },
  content: {
    lineHeight: 1.8,
    color: "#e2e8f0",
    whiteSpace: "pre-wrap",
  },
  editButton: {
    marginTop: "24px",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid #38bdf8",
    backgroundColor: "transparent",
    color: "#38bdf8",
    cursor: "pointer",
  },
  commentsCard: {
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },
  commentList: {
    display: "grid",
    gap: "16px",
    marginTop: "18px",
  },
  commentItem: {
    padding: "18px",
    borderRadius: "14px",
    backgroundColor: "#020617",
    border: "1px solid #334155",
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    gap: "12px",
    color: "#94a3b8",
  },
  infoText: {
    color: "#94a3b8",
    lineHeight: 1.7,
  },
  categoryTag: {
    marginLeft: "10px",
    padding: "6px 12px",
    borderRadius: "999px",
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    fontSize: "0.85rem",
  },
  form: {
    marginTop: "24px",
    display: "grid",
    gap: "18px",
  },
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
  saveButton: {
    width: "fit-content",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#38bdf8",
    color: "#020617",
    cursor: "pointer",
  },
  status: {
    marginTop: "18px",
    color: "#a5f3fc",
  },
};

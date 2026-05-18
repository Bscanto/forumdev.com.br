import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadCategories();
    const storedUser = window.localStorage.getItem("forumdev_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthor(JSON.parse(storedUser).name);
    }
  }, []);

  useEffect(() => {
    const categoryFromQuery = Array.isArray(router.query.category)
      ? router.query.category[0]
      : router.query.category || "";
    setSelectedCategory(categoryFromQuery);
    loadPosts(categoryFromQuery);
  }, [router.query.category]);

  async function loadCategories() {
    try {
      const response = await fetch("/api/v1/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadPosts(category = "") {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const url = category
        ? `/api/v1/posts?category=${encodeURIComponent(category)}`
        : "/api/v1/posts";
      const response = await fetch(url);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setStatusMessage("Não foi possível carregar os posts.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatusMessage("");

    if (!title || !content) {
      setStatusMessage("Preencha título e conteúdo antes de enviar.");
      return;
    }

    try {
      const token = window.localStorage.getItem("forumdev_token");
      let categoryId = null;

      if (newCategoryName) {
        if (!token) {
          setStatusMessage("Faça login para criar uma nova categoria.");
          return;
        }

        if (!newCategoryDescription) {
          setStatusMessage("Informe a descrição da nova categoria.");
          return;
        }

        const createResponse = await fetch("/api/v1/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newCategoryName,
            description: newCategoryDescription,
          }),
        });

        const createBody = await createResponse.json();
        if (!createResponse.ok) {
          throw new Error(createBody.error || "Falha ao criar categoria.");
        }

        categoryId = createBody.id;
        setCategories((current) => [...current, createBody]);
        setSelectedCategory(createBody.name);
        setNewCategoryName("");
        setNewCategoryDescription("");
      } else if (selectedCategory) {
        categoryId = categories.find(
          (category) => category.name === selectedCategory,
        )?.id;
      }

      const response = await fetch("/api/v1/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          content,
          author: author || undefined,
          categoryId,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || "Falha ao criar o post");
      }

      setTitle("");
      setContent("");
      setStatusMessage("Post criado com sucesso!");
      await loadPosts(selectedCategory || newCategoryName || "");
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  function handleCategoryChange(event) {
    const value = event.target.value;
    setSelectedCategory(value);
    const route = value
      ? `/posts?category=${encodeURIComponent(value)}`
      : "/posts";
    router.push(route, undefined, { shallow: true });
  }

  return (
    <>
      <Head>
        <title>Posts — forum.dev</title>
      </Head>

      <main style={styles.main}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>Posts do fórum</h1>
            <p style={styles.subtitle}>
              Leia os posts mais recentes ou compartilhe algo novo com a
              comunidade.
            </p>
            <div style={styles.metaRow}>
              {user ? (
                <span style={styles.welcomeText}>Logado como {user.name}</span>
              ) : (
                <Link href="/login" style={styles.actionLink}>
                  Faça login para comentar e criar posts com seu nome
                </Link>
              )}
            </div>
          </div>

          <div style={styles.actionsColumn}>
            <label style={styles.filterLabel}>
              Filtrar por categoria
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                style={styles.select}
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <Link href="/" style={styles.linkButton}>
              Voltar ao início
            </Link>
          </div>
        </div>

        <section style={styles.grid}>
          <article style={styles.formCard}>
            <h2 style={styles.sectionTitle}>Novo post</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>
                Título
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  style={styles.input}
                  placeholder="Título do post"
                />
              </label>

              <label style={styles.label}>
                Conteúdo
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  style={{ ...styles.input, minHeight: "140px" }}
                  placeholder="Escreva sua dúvida ou dica aqui"
                />
              </label>

              <label style={styles.label}>
                Categoria
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  style={styles.input}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <p style={styles.helpText}>
                Ou crie uma nova categoria ao publicar.
              </p>

              <label style={styles.label}>
                Nova categoria
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  style={styles.input}
                  placeholder="Nome da categoria"
                />
              </label>

              <label style={styles.label}>
                Descrição da nova categoria
                <textarea
                  value={newCategoryDescription}
                  onChange={(event) =>
                    setNewCategoryDescription(event.target.value)
                  }
                  style={{ ...styles.input, minHeight: "100px" }}
                  placeholder="Descreva por que essa categoria existe"
                />
              </label>

              <label style={styles.label}>
                Autor
                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  style={styles.input}
                  placeholder={
                    user ? "O seu nome será usado automaticamente" : "Seu nome"
                  }
                />
              </label>

              <button type="submit" style={styles.button}>
                Publicar
              </button>
            </form>

            {statusMessage && <p style={styles.status}>{statusMessage}</p>}
          </article>

          <article style={styles.postsCard}>
            <h2 style={styles.sectionTitle}>Últimos posts</h2>

            {isLoading ? (
              <p>Carregando posts...</p>
            ) : posts.length === 0 ? (
              <p>Nenhum post encontrado ainda. Publique o primeiro!</p>
            ) : (
              <div style={styles.postsList}>
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    style={styles.postItem}
                  >
                    <div style={styles.postLabelRow}>
                      <h3>{post.title}</h3>
                      {post.category && (
                        <span style={styles.categoryBadge}>
                          {post.category}
                        </span>
                      )}
                    </div>
                    <p>{post.content.slice(0, 120)}...</p>
                    <span>por {post.author}</span>
                  </Link>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    padding: "40px 24px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto 32px",
  },
  title: {
    fontSize: "2.8rem",
    margin: 0,
    color: "#38bdf8",
  },
  subtitle: {
    marginTop: "12px",
    maxWidth: "720px",
    color: "#94a3b8",
    lineHeight: 1.75,
  },
  linkButton: {
    padding: "14px 20px",
    backgroundColor: "transparent",
    border: "1px solid #38bdf8",
    borderRadius: "10px",
    color: "#38bdf8",
    textDecoration: "none",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  formCard: {
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },
  postsCard: {
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
  form: {
    display: "grid",
    gap: "18px",
  },
  label: {
    display: "grid",
    gap: "10px",
    color: "#cbd5e1",
    fontSize: "0.95rem",
  },
  helpText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.9rem",
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
    marginTop: "4px",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#38bdf8",
    color: "#020617",
    fontWeight: 700,
    cursor: "pointer",
  },
  metaRow: {
    marginTop: "16px",
  },
  welcomeText: {
    color: "#a5f3fc",
  },
  actionLink: {
    color: "#38bdf8",
    textDecoration: "underline",
  },
  filterLabel: {
    display: "grid",
    gap: "8px",
    color: "#cbd5e1",
    fontSize: "0.95rem",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #334155",
    backgroundColor: "#020617",
    color: "#e2e8f0",
  },
  actionsColumn: {
    display: "grid",
    gap: "16px",
    alignItems: "start",
  },
  status: {
    marginTop: "16px",
    color: "#a5f3fc",
  },
  postsList: {
    display: "grid",
    gap: "16px",
  },
  postLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  categoryBadge: {
    padding: "4px 12px",
    backgroundColor: "#1e293b",
    borderRadius: "999px",
    color: "#38bdf8",
    fontSize: "0.8rem",
  },
  postItem: {
    display: "block",
    padding: "18px",
    borderRadius: "16px",
    border: "1px solid #334155",
    backgroundColor: "#020617",
    color: "#e2e8f0",
    textDecoration: "none",
  },
};

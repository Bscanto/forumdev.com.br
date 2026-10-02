# Supabase — ForumDev

Projeto Supabase de produção:

- nome: `forumdev`
- região: `sa-east-1`
- project ref: `adsdrrujadrglnhguzhm`

## Arquitetura

```
GitHub -> Vercel -> Next.js/API -> Supabase PostgreSQL
```

O backend acessa o PostgreSQL diretamente usando `DATABASE_URL`.

## Configuração da Vercel

No projeto `forumdev.com.br`, configure:

```
DATABASE_URL=<connection string do Supabase>
JWT_SECRET=<segredo longo e aleatório>
```

Para runtime serverless, use preferencialmente o **Transaction Pooler** do Supabase quando compatível com o cliente; caso necessário para compatibilidade de sessão, use o **Session Pooler**.

## Banco

O schema principal possui:

- `users`
- `categories`
- `posts`
- `comments`

RLS está habilitado nas tabelas públicas. O ForumDev acessa o banco pelo backend, não pela Data API do navegador.

## Validação após configurar a Vercel

1. abrir `/api/v1/status`;
2. cadastrar usuário;
3. fazer login;
4. criar post;
5. comentar;
6. validar categorias;
7. validar área administrativa.

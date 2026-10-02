# Migração do ForumDev: Neon → Supabase

O ForumDev continua usando PostgreSQL através de `DATABASE_URL`. A aplicação não depende de recursos proprietários do Neon, então a troca de provedor não exige reescrever o backend.

## 1. Criar o projeto no Supabase

Crie um projeto no Supabase e guarde a senha do banco.

No painel do projeto, abra **Connect** e copie a connection string do **Session pooler**. Ela será usada durante a migração e também é a opção recomendada para ambientes serverless quando uma conexão persistente direta não é adequada.

## 2. Obter a connection string do Neon

No Neon, copie a connection string **não pooled** do banco atual.

Não coloque nenhuma das connection strings no GitHub.

## 3. Executar a migração

No terminal local:

```bash
export OLD_DB_URL='postgresql://...neon...'
export NEW_DB_URL='postgresql://...supabase-pooler...'

chmod +x scripts/migrate-neon-to-supabase.sh
./scripts/migrate-neon-to-supabase.sh
```

O script cria `forumdev-neon-backup.sql` por padrão e importa os dados no Supabase.

## 4. Validar no Supabase

Confirme que as principais tabelas existem:

- `users`
- `categories`
- `posts`
- `comments`
- `mpmigrations`

Também confirme constraints, chaves estrangeiras e contagem de registros.

## 5. Trocar a Vercel

No projeto do ForumDev na Vercel:

1. substitua `DATABASE_URL` pela connection string do Supabase;
2. mantenha `JWT_SECRET`;
3. faça um novo deploy;
4. valide `/api/v1/status`;
5. teste cadastro, login, criação de post, comentário, categorias e área administrativa.

## 6. Desativar o Neon somente depois da validação

Mantenha o Neon intacto até confirmar que produção está lendo e gravando no Supabase. Depois da validação, faça um backup final e só então desative o banco antigo.

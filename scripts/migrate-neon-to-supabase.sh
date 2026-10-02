#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${OLD_DB_URL:-}" || -z "${NEW_DB_URL:-}" ]]; then
  echo "Defina OLD_DB_URL (Neon) e NEW_DB_URL (Supabase Session Pooler) antes de executar."
  exit 1
fi

command -v pg_dump >/dev/null 2>&1 || {
  echo "pg_dump não encontrado. Instale os client tools do PostgreSQL."
  exit 1
}

command -v psql >/dev/null 2>&1 || {
  echo "psql não encontrado. Instale os client tools do PostgreSQL."
  exit 1
}

DUMP_FILE="${DUMP_FILE:-forumdev-neon-backup.sql}"

echo "1/3 Exportando banco Neon para ${DUMP_FILE}..."
pg_dump "${OLD_DB_URL}"   --clean   --if-exists   --quote-all-identifiers   --no-owner   --no-privileges   > "${DUMP_FILE}"

echo "2/3 Importando no Supabase..."
psql -d "${NEW_DB_URL}" -f "${DUMP_FILE}"

echo "3/3 Migração concluída."
echo "Agora configure DATABASE_URL na Vercel com a connection string do Supabase e valide /api/v1/status."

#!/usr/bin/env bash
# Primer arranque: dependencias npm, migraciones SQL y seeds.
# Uso:
#   ./install.sh              # levanta servicios Docker (compose en raíz) y luego migra + seed
#   ./install.sh --no-docker  # solo migra + seed (bases ya corriendo según api/.env)
#
# El compose usa variables del archivo .env en la RAÍZ del repo (no api/.env).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$SCRIPT_DIR"

COMPOSE=(docker compose --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker-compose.yml")

USE_DOCKER=true
for arg in "$@"; do
  if [[ "$arg" == "--no-docker" ]]; then
    USE_DOCKER=false
  fi
done

if [[ "$USE_DOCKER" == "true" ]]; then
  if ! command -v docker &>/dev/null; then
    echo "[install] Docker no está instalado. Usá bases locales y ejecutá: ./install.sh --no-docker"
    exit 1
  fi
  if [[ ! -f "$REPO_ROOT/.env" ]]; then
    if [[ -f "$REPO_ROOT/.env.example" ]]; then
      cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env"
      echo "[install] Creado ${REPO_ROOT}/.env desde .env.example — completá contraseñas y usuarios."
    else
      echo "[install] Falta ${REPO_ROOT}/.env (y .env.example en la raíz)."
      exit 1
    fi
  fi
  echo "[install] Levantando contenedores (compose en ${REPO_ROOT})…"
  "${COMPOSE[@]}" up -d mariadb mongo redis

  echo "[install] Esperando a que MariaDB acepte conexiones…"
  for _ in $(seq 1 90); do
    if "${COMPOSE[@]}" exec -T mariadb sh -c 'mariadb-admin ping -h localhost -uroot -p"$MYSQL_ROOT_PASSWORD" --silent' 2>/dev/null; then
      break
    fi
    sleep 2
  done
  echo "[install] MariaDB listo."
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "[install] Creado api/.env desde .env.example (alineá DB_* con el .env de la raíz si usás Docker)."
fi

echo "[install] npm install…"
npm install

echo "[install] Migraciones (TypeORM)…"
npm run migration:run

echo "[install] Seeds…"
npm run seed

echo "[install] Listo. Arranque: npm run start:dev  →  http://localhost:${PORT:-3000}/v1"

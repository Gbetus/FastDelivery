#!/usr/bin/env bash
# Instalación 1 clic para FastDelivery:
# - Crea .env faltantes desde .env.example
# - Levanta MariaDB y MongoDB con Docker Compose (opcional)
# - Instala dependencias de api/ y mobile/
# - Ejecuta migraciones y seed en api/
#
# Uso:
#   ./install.sh
#   ./install.sh --no-docker
#   ./install.sh --skip-mobile
#   ./install.sh --skip-seed
#   ./install.sh --yes-start-api

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$ROOT_DIR/api"
MOBILE_DIR="$ROOT_DIR/mobile"

USE_DOCKER=true
RUN_MOBILE=true
RUN_SEED=true
YES_START_API=false

for arg in "$@"; do
  case "$arg" in
    --no-docker) USE_DOCKER=false ;;
    --skip-mobile) RUN_MOBILE=false ;;
    --skip-seed) RUN_SEED=false ;;
    --yes-start-api) YES_START_API=true ;;
    *)
      echo "[install] Opción no reconocida: $arg"
      echo "Uso: ./install.sh [--no-docker] [--skip-mobile] [--skip-seed] [--yes-start-api]"
      exit 1
      ;;
  esac
done

copy_env_if_missing() {
  local env_file="$1"
  local env_example="$2"
  local label="$3"
  if [[ -f "$env_file" ]]; then
    echo "[install] $label ya existe."
    return
  fi
  if [[ ! -f "$env_example" ]]; then
    echo "[install] Falta plantilla: $env_example"
    exit 1
  fi
  cp "$env_example" "$env_file"
  echo "[install] Creado $label desde $(basename "$env_example")."
}

load_env_file() {
  local env_file="$1"
  local line_number=0
  if [[ ! -f "$env_file" ]]; then
    return
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    line_number=$((line_number + 1))
    # Ignorar comentarios y líneas vacías.
    [[ -z "${line//[[:space:]]/}" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    # Mantener solo líneas tipo KEY=VALUE.
    if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local value="${BASH_REMATCH[2]}"

      # Quitar espacios laterales al valor.
      value="${value#"${value%%[![:space:]]*}"}"
      value="${value%"${value##*[![:space:]]}"}"

      # Quitar comillas externas simples o dobles.
      if [[ "$value" =~ ^\"(.*)\"$ ]]; then
        value="${BASH_REMATCH[1]}"
      elif [[ "$value" =~ ^\'(.*)\'$ ]]; then
        value="${BASH_REMATCH[1]}"
      fi

      export "$key=$value"
    else
      echo "[install][warn] Línea ignorada en $(basename "$env_file"):$line_number -> $line"
    fi
  done < "$env_file"
}

create_db_if_missing() {
  local db_name="$1"
  if [[ -z "$db_name" ]]; then
    return
  fi
  if [[ ! "$db_name" =~ ^[A-Za-z0-9_]+$ ]]; then
    echo "[install] Nombre de BD inválido, se omite: $db_name"
    return
  fi
  docker compose --env-file "$ROOT_DIR/.env" -f "$ROOT_DIR/docker-compose.yml" exec -T mariadb \
    sh -lc "mariadb -uroot -p\"\$MYSQL_ROOT_PASSWORD\" -e \"CREATE DATABASE IF NOT EXISTS $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
  echo "[install] Base de datos garantizada: $db_name"
}

echo "[install] Preparando archivos .env..."
copy_env_if_missing "$ROOT_DIR/.env" "$ROOT_DIR/.env.example" ".env (raíz)"
copy_env_if_missing "$API_DIR/.env" "$API_DIR/.env.example" "api/.env"
copy_env_if_missing "$MOBILE_DIR/.env" "$MOBILE_DIR/.env.example" "mobile/.env"
load_env_file "$ROOT_DIR/.env"
load_env_file "$API_DIR/.env"

if [[ "$USE_DOCKER" == "true" ]]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "[install] Docker no está disponible. Ejecuta con --no-docker o instala Docker."
    exit 1
  fi

  echo "[install] Levantando MariaDB y MongoDB..."
  docker compose --env-file "$ROOT_DIR/.env" -f "$ROOT_DIR/docker-compose.yml" up -d mariadb mongo

  mariadb_ready=false
  mongo_ready=false
  mariadb_id="$(docker compose --env-file "$ROOT_DIR/.env" -f "$ROOT_DIR/docker-compose.yml" ps -q mariadb)"
  mongo_id="$(docker compose --env-file "$ROOT_DIR/.env" -f "$ROOT_DIR/docker-compose.yml" ps -q mongo)"

  if [[ -z "$mariadb_id" || -z "$mongo_id" ]]; then
    echo "[install] No se pudieron resolver los contenedores de mariadb/mongo."
    exit 1
  fi

  echo "[install] Esperando MariaDB (healthcheck)..."
  for _ in $(seq 1 90); do
    if [[ "$(docker inspect --format "{{.State.Health.Status}}" "$mariadb_id" 2>/dev/null || true)" == "healthy" ]]; then
      mariadb_ready=true
      break
    fi
    sleep 2
  done

  if [[ "$mariadb_ready" != "true" ]]; then
    echo "[install] MariaDB no quedó listo a tiempo."
    exit 1
  fi

  echo "[install] Esperando MongoDB (healthcheck)..."
  for _ in $(seq 1 60); do
    if [[ "$(docker inspect --format "{{.State.Health.Status}}" "$mongo_id" 2>/dev/null || true)" == "healthy" ]]; then
      mongo_ready=true
      break
    fi
    sleep 2
  done

  if [[ "$mongo_ready" != "true" ]]; then
    echo "[install] MongoDB no quedó listo a tiempo."
    exit 1
  fi

  echo "[install] Validando creación de base de datos SQL..."
  create_db_if_missing "${MYSQL_DATABASE:-}"
  if [[ "${DB_NAME:-}" != "${MYSQL_DATABASE:-}" ]]; then
    create_db_if_missing "${DB_NAME:-}"
  fi
fi

echo "[install] Instalando dependencias API..."
npm --prefix "$API_DIR" install

echo "[install] Ejecutando migraciones API..."
npm --prefix "$API_DIR" run migration:run

if [[ "$RUN_SEED" == "true" ]]; then
  echo "[install] Ejecutando seed API..."
  npm --prefix "$API_DIR" run seed
else
  echo "[install] Seed omitido (--skip-seed)."
fi

if [[ "$RUN_MOBILE" == "true" ]]; then
  echo "[install] Instalando dependencias Mobile..."
  npm --prefix "$MOBILE_DIR" install
else
  echo "[install] Instalación de Mobile omitida (--skip-mobile)."
fi

echo
echo "[install] Instalación completa."
echo "[install] API:    cd api && npm run start:dev"
echo "[install] Mobile: cd mobile && npm run start"
echo "[install] Postman: importar colección y environment de ./postman"

if [[ "$YES_START_API" == "true" ]]; then
  echo "[install] Iniciando API automáticamente..."
  npm --prefix "$API_DIR" run start:dev
elif [[ -t 0 ]]; then
  read -r -p "[install] ¿Quieres iniciar API ahora? (y/N): " start_api
  if [[ "$start_api" =~ ^[Yy]$ ]]; then
    npm --prefix "$API_DIR" run start:dev
  fi
fi

# Servicios: MariaDB, MongoDB y Redis

Guía para levantar y validar contenedores definidos en `docker-compose.yml`.

## Qué `.env` usa esta guía

- `/.env` (raíz): variables de infraestructura para `docker-compose` (contenedores, imágenes, puertos, credenciales de DB).
- Esta guía no cubre configuración de `api/.env` ni `mobile/.env`.

Las credenciales y puertos salen del **`.env` en la raíz del repo** (no van hardcodeadas en el YAML). Copiá la plantilla:

```bash
cp .env.example .env
```

Editá `.env` y completá al menos:

- `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
- `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`

Puertos e imágenes tienen valores de ejemplo en `.env.example`; cambiálos solo si hay conflicto en tu máquina.

---

## 1. Levantar contenedores

Desde la raíz del repositorio (donde está `docker-compose.yml`):

```bash
docker compose up -d
```

Esto arranca **MariaDB** y **MongoDB** en la red Docker `fastdelivery_net`.
`Redis` está comentado en `docker-compose.yml` porque actualmente no se usa en la app.

Ver estado:

```bash
docker compose ps
```

Logs (ejemplo MariaDB):

```bash
docker compose logs -f mariadb
```

**Parar** (los datos en volúmenes se conservan):

```bash
docker compose down
```

**Parar y borrar volúmenes** (pierde datos de las bases):

```bash
docker compose down -v
```

Si ejecutás `docker compose` desde otra carpeta, indicá el archivo y el env:

```bash
docker compose --env-file /ruta/al/demo/.env -f /ruta/al/demo/docker-compose.yml up -d
```

---

## 2. Comprobaciones rápidas de servicios

| Qué | Cómo |
|-----|------|
| Estado de contenedores | `docker compose ps` |
| MariaDB (healthcheck) | `docker inspect --format='{{json .State.Health.Status}}' fastdelivery-mariadb` |
| MongoDB (healthcheck) | `docker inspect --format='{{json .State.Health.Status}}' fastdelivery-mongo` |
| Puerto MariaDB publicado | `nc -zv 127.0.0.1 ${MARIADB_PUBLISHED_PORT}` |
| Puerto MongoDB publicado | `nc -zv 127.0.0.1 ${MONGO_PUBLISHED_PORT}` |

Si tu sistema no tiene `nc`, podés validar puertos con:

```bash
lsof -iTCP -sTCP:LISTEN | rg "3306|27017"
```

---

## 3. Referencias en el repo

- `docker-compose.yml` — servicios y red.
- `.env.example` — variables que usa Compose.

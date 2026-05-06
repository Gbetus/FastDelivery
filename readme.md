# FastDelivery - Guía de ejecución local

Este repositorio contiene una solución de logística de última milla con:

- `api/`: backend NestJS (JWT + SQL + MongoDB).
- `mobile/`: app móvil Expo React Native.
- `postman/`: colección y environment para pruebas funcionales.

## Navegación rápida

- [Guía de servicios (MariaDB y MongoDB)](./00-servicios-db-redis-mongo.md)
- [Guía de instalación API](./01-instalacion-api.md)
- [Guía de instalación Mobile](./02-instalacion-mobile.md)
- [Guía de pruebas Postman](./postman/README.md)

## 1) Prerrequisitos

- Node.js 20 o superior
- npm 10 o superior
- Docker Desktop (o Docker Engine + Docker Compose v2)
- Postman Desktop
- Expo Go (si pruebas en dispositivo físico)

Opcionales según entorno mobile:

- Android Studio (emulador Android)
- Xcode (simulador iOS, solo macOS)

## Instalación rápida (1 clic)

Desde la raíz del proyecto:

```bash
chmod +x install.sh
./install.sh
```

Este script:

- crea `.env` faltantes desde sus `.env.example`,
- levanta MariaDB y MongoDB en Docker,
- instala dependencias de `api/` y `mobile/`,
- ejecuta migraciones y seed del backend.

Opciones útiles:

- `./install.sh --no-docker` (usa bases ya existentes)
- `./install.sh --skip-mobile` (omite instalación de mobile)
- `./install.sh --skip-seed` (omite carga de datos demo)
- `./install.sh --yes-start-api` (arranca la API al terminar, sin preguntar)

Al finalizar, el script puede preguntarte si deseas iniciar la API automáticamente.

## 2) Propósito de cada archivo `.env`

- `/.env` (raíz): infraestructura para `docker-compose` (MariaDB y MongoDB).
- `api/.env`: configuración del backend NestJS (SQL, Mongo, JWT, seed).
- `mobile/.env`: configuración de la app móvil (`EXPO_PUBLIC_API_URL`).

Nota: Redis está inactivo actualmente; sus variables están comentadas.

## 3) Levantar infraestructura (DBs)

Desde la raíz del proyecto:

```bash
cp .env.example .env
docker compose up -d
docker compose ps
```

Esto levanta MariaDB y MongoDB con los valores de `/.env`.

## 4) Levantar backend (API)

Desde `api/`:

```bash
cd api
cp .env.example .env
npm install
npm run migration:run
npm run seed
npm run start:dev
```

API base URL local: `http://localhost:3000/v1`

### Credenciales demo (seed)

Credenciales demo Repartidor:

- Email: `repartidor@fastdelivery.local`
- Password: `RepartidorPassword`

Credenciales demo Admin:

- Email: `admin@fastdelivery.local`
- Password: `AdminPassword`

## 5) Levantar mobile (Expo)

Desde `mobile/`:

```bash
cd mobile
cp .env.example .env
npm install
npm run start
```

Configura `EXPO_PUBLIC_API_URL` en `mobile/.env`:

- iOS Simulator: `http://localhost:3000/v1`
- Android Emulator: `http://10.0.2.2:3000/v1`
- Dispositivo físico: `http://<IP_DE_TU_PC>:3000/v1`

## 6) Probar API con Postman (JWT)

1. Importar en Postman:
   - `postman/FastDelivery.postman_collection.json`
   - `postman/FastDelivery.local.postman_environment.json`
2. Seleccionar environment `FastDelivery Local`.
3. Ejecutar requests en este orden:
   - `Auth / Login` (guarda `token` y `driverId`).
   - `Auth / Me (JWT)` (valida autenticación).
   - `Orders / Listar pedidos por repartidor`.
   - `Orders / Cambiar estado`.
   - `Orders / Historial combinado del pedido`.

Si cambias `SEED_USER_EMAIL` o `SEED_USER_PASSWORD` en `api/.env`, actualiza también esos valores en el environment de Postman.

Para pruebas de endpoints protegidos de administración en Postman, inicia sesión también con las credenciales de Admin.

## 7) Flujo funcional esperado

Al finalizar la configuración, deberías poder:

- Iniciar sesión con JWT.
- Consultar pedidos asignados al repartidor.
- Cambiar estado de un pedido.
- Consultar historial combinado (SQL + MongoDB).

## 8) Entregables esperados del proyecto

- Código fuente versionado (`api`, `mobile`, `postman`).
- Documentación de ejecución local (este README y guías complementarias).
- Colección Postman funcional con autenticación.
- Evidencia de flujo completo funcionando (login, pedidos, cambio de estado, historial).

## 9) Documentación complementaria

- [00-servicios-db-redis-mongo.md](./00-servicios-db-redis-mongo.md): solo infraestructura y conexión a servicios (Docker, MariaDB, MongoDB).
- [01-instalacion-api.md](./01-instalacion-api.md): solo backend API (configuración, migraciones, seed y arranque).
- [02-instalacion-mobile.md](./02-instalacion-mobile.md): solo app móvil (configuración de `EXPO_PUBLIC_API_URL` y ejecución).
- [postman/README.md](./postman/README.md): solo pruebas de endpoints con autenticación JWT.

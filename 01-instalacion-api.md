# 01 - Instalacion API (NestJS)

Descripcion del archivo: guia para instalar y levantar el backend `api` en entorno local.

## Alcance de cada archivo `.env`

- `/.env` (raíz): lo usa `docker-compose` para levantar servicios de infraestructura.
- `api/.env`: lo usa NestJS al ejecutar la API.

En este instructivo trabajas con `api/.env`. Si levantas bases con Docker, también debes tener configurado `/.env`.

## Requisitos

- Node.js 20 o superior
- npm
- MariaDB y MongoDB disponibles (local o Docker)

## Pasos de instalacion

1. Entrar al proyecto del backend:

```bash
cd api
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
```

Nota: `REDIS_HOST` y `REDIS_PORT` están comentadas en `api/.env.example` porque Redis no está en uso actualmente.

4. (Opcional) Ejecutar instalacion inicial automatizada:

```bash
npm run install:first
```

## Levantar el servidor

```bash
npm run start:dev
```

Base URL local:

`http://localhost:3000/v1`

## Comprobaciones rapidas del servicio

Con la API corriendo en otra terminal (`npm run start:dev`), valida lo siguiente:

1. Verificar que el servicio responde:

```bash
curl -i http://localhost:3000/v1
```

Resultado esperado: codigo `200` o `404` (importante: que el servidor responda y no falle la conexion).

2. Probar login con usuario demo (si ya ejecutaste seed):

```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"repartidor@fastdelivery.local","password":"RepartidorPassword"}'
```

Resultado esperado: respuesta JSON con token (`access_token` o similar).

Si falla alguna comprobacion, revisa variables en `api/.env`, estado de MariaDB/MongoDB y logs en la terminal de NestJS.

## Datos demo (seed)

Para cargar datos de prueba:

```bash
npm run seed
```

El seed crea dos usuarios demo por defecto:

- Repartidor
  - Email: `repartidor@fastdelivery.local`
  - Password: `RepartidorPassword`
- Admin
  - Email: `admin@fastdelivery.local`
  - Password: `AdminPassword`

## Comandos utiles

- `npm run build`: compilar proyecto
- `npm run test`: pruebas unitarias
- `npm run migration:run`: correr migraciones

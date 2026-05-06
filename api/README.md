## FastDelivery API

Backend del reto tecnico de ultima milla con NestJS + TypeORM + Mongo.

## Stack

- Node/NestJS
- MariaDB (usuarios, clientes, pedidos)
- MongoDB (trazabilidad de estados)
- JWT (autenticacion)

## Primer arranque

Desde `api/`:

```bash
./install.sh
```

Sin Docker:

```bash
./install.sh --no-docker
```

Luego:

```bash
npm run start:dev
```

API base: `http://localhost:3000/v1`

## Variables

- Copiar `api/.env.example` a `api/.env`.
- Si usas docker compose raiz, copiar `.env.example` a `.env` en la raiz.

## Seed

```bash
npm run seed
```

El seed crea usuario y pedidos de demo en distintos estados.

Credenciales demo por defecto:

- Email: `repartidor@fastdelivery.local`
- Password: `RepartidorPassword`

## Endpoints principales

### Auth

- `POST /deliverer/login`
- `POST /deliverer/register` (solo admin con JWT)
- `POST /admin/login`
- `GET /auth/me` (JWT)

Body ejemplo para crear nuevo repartidor:

```json
{
  "email": "repartidor2@fastdelivery.local",
  "password": "RepartidorPassword",
  "nombre": "Repartidor Demo Dos"
}
```

### Orders

- `POST /orders` (publico, sin JWT)
- `GET /orders` (JWT: repartidor = sus pedidos, admin = listado global)
- `GET /orders/:id` (JWT)
- `PATCH /orders/:id/status`
- `GET /orders/:id/history`
- `GET /orders/with-drivers` (solo admin con JWT)

Filtros soportados en `GET /orders`:

- `status` (`PENDIENTE`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO`)
- `date` (formato `YYYY-MM-DD`)
- `customer` (busqueda parcial por nombre)

## Pruebas API y Postman

- Documento de pruebas: `docs/pruebas-api.md`
- Coleccion: `postman/FastDelivery.postman_collection.json`
- Environment local: `postman/FastDelivery.local.postman_environment.json`

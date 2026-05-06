# Postman - Guia de uso

Esta carpeta contiene artefactos para ejecutar pruebas funcionales de la API:

- `FastDelivery.postman_collection.json`
- `FastDelivery.local.postman_environment.json`

## 1) Importar en Postman

1. Abrir Postman.
2. Importar la coleccion `FastDelivery.postman_collection.json`.
3. Importar el environment `FastDelivery.local.postman_environment.json`.
4. Seleccionar el environment **FastDelivery Local**.

## 2) Preparar backend y datos

Desde `api/`:

1. Instalar dependencias:
   - `npm install`
2. Ejecutar migraciones:
   - `npm run migration:run`
3. Ejecutar seed:
   - `npm run seed`
4. Levantar API:
   - `npm run start:dev`

La base URL por defecto de la coleccion es:

- `http://localhost:3000/v1`

## 3) Flujo recomendado de requests

1. `Auth / Login`
   - Guarda automaticamente `token` y `driverId` en el environment.
2. `Auth / Me (JWT)`
   - Verifica que el token sea valido.
3. `Orders / Listar pedidos por repartidor`
   - Usa `driverId` del login.
4. Definir manualmente `orderId` (si es necesario).
5. `Orders / Cambiar estado a EN_CAMINO`
6. `Orders / Cambiar estado a ENTREGADO`
7. `Orders / Historial combinado del pedido`

## 4) Variables del environment

- `baseUrl`: URL base del backend.
- `seedUserEmail`: usuario seed para login.
- `seedUserPassword`: password seed para login.
- `token`: JWT guardado automaticamente tras login.
- `driverId`: id de usuario guardado automaticamente tras login.
- `orderId`: id del pedido a usar en pruebas de status/historial.

## 5) Notas importantes

- Si cambias `SEED_USER_EMAIL` o `SEED_USER_PASSWORD` en `api/.env`, actualiza tambien el environment de Postman.
- En el estado actual del proyecto, `Auth` esta disponible y `Orders` puede depender de implementacion adicional de endpoints.
- El set de requests de `Orders` se deja listo para la evaluacion del reto tecnico.

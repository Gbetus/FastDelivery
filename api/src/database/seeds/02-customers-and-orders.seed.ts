import type { SeedContext } from './types';

function insertId(result: unknown): string {
  const r = result as { insertId?: number };
  if (typeof r?.insertId === 'number') {
    return String(r.insertId);
  }
  const arr = result as [{ insertId?: number }?];
  if (Array.isArray(arr) && arr[0] && typeof arr[0].insertId === 'number') {
    return String(arr[0].insertId);
  }
  throw new Error('No se pudo obtener insertId del INSERT');
}

/**
 * Datos mínimos para probar listado y detalle de pedidos (reto FastDelivery).
 */
export async function seedCustomersAndOrders(ctx: SeedContext): Promise<void> {
  const { dataSource, config } = ctx;

  const email = config.get<string>('SEED_USER_EMAIL')?.trim().toLowerCase();
  if (!email) {
    console.log('[seed:orders] Sin SEED_USER_EMAIL, se omite.');
    return;
  }

  const users = await dataSource.query<{ id: string }[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  if (users.length === 0) {
    console.log('[seed:orders] No hay usuario seed; se omite.');
    return;
  }
  const userId = users[0].id;

  const existingOrders = await dataSource.query<{ c: string }[]>(
    'SELECT COUNT(*) AS c FROM orders WHERE assigned_user_id = ?',
    [userId],
  );
  if (Number(existingOrders[0]?.c) > 0) {
    console.log('[seed:orders] Ya hay pedidos para el repartidor seed; se omite.');
    return;
  }

  const ins1 = await dataSource.query(
    `INSERT INTO customers (nombre, telefono, direccion_entrega, created_at, updated_at)
     VALUES (?, ?, ?, NOW(3), NOW(3))`,
    ['Cliente Demo Uno', '+52 555 1001', 'Calle Falsa 123, CDMX'],
  );
  const ins2 = await dataSource.query(
    `INSERT INTO customers (nombre, telefono, direccion_entrega, created_at, updated_at)
     VALUES (?, ?, ?, NOW(3), NOW(3))`,
    ['Cliente Demo Dos', '+52 555 1002', 'Av. Siempre Viva 742, CDMX'],
  );

  const customer1Id = insertId(ins1);
  const customer2Id = insertId(ins2);

  await dataSource.query(
    `INSERT INTO orders (customer_id, assigned_user_id, estado, notas_pedido, created_at, updated_at)
     VALUES (?, ?, 'PENDIENTE', ?, NOW(3), NOW(3))`,
    [customer1Id, userId, 'Pedido demo 1'],
  );
  await dataSource.query(
    `INSERT INTO orders (customer_id, assigned_user_id, estado, notas_pedido, created_at, updated_at)
     VALUES (?, ?, 'EN_CAMINO', ?, NOW(3), NOW(3))`,
    [customer2Id, userId, 'Pedido demo 2'],
  );

  console.log('[seed:orders] Clientes y 2 pedidos de demo creados.');
}

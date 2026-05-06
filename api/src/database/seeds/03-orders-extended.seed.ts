import type { SeedContext } from './types';

interface SeedOrder {
  customerName: string;
  phone: string;
  address: string;
  status: 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  notes: string;
}

function asCount(result: unknown): number {
  const rows = result as Array<{ c?: string | number }>;
  const raw = rows?.[0]?.c ?? 0;
  return Number(raw);
}

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

const EXTRA_ORDERS: SeedOrder[] = [
  {
    customerName: 'Cliente Demo Tres',
    phone: '+52 555 1003',
    address: 'Insurgentes Sur 500, CDMX',
    status: 'PENDIENTE',
    notes: 'Pedido farmacia',
  },
  {
    customerName: 'Cliente Demo Cuatro',
    phone: '+52 555 1004',
    address: 'Reforma 120, CDMX',
    status: 'EN_CAMINO',
    notes: 'Pedido supermercado',
  },
  {
    customerName: 'Cliente Demo Cinco',
    phone: '+52 555 1005',
    address: 'Polanco 88, CDMX',
    status: 'ENTREGADO',
    notes: 'Pedido ecommerce',
  },
  {
    customerName: 'Cliente Demo Seis',
    phone: '+52 555 1006',
    address: 'Coyoacan 45, CDMX',
    status: 'CANCELADO',
    notes: 'Pedido restaurante',
  },
];

/**
 * Inserta pedidos extra para tener un set mas completo de pruebas.
 * Es idempotente: si ya existen pedidos con la marca [seed-extra], no inserta de nuevo.
 */
export async function seedExtendedOrders(ctx: SeedContext): Promise<void> {
  const { dataSource, config } = ctx;

  const email = config.get<string>('SEED_USER_EMAIL')?.trim().toLowerCase();
  if (!email) {
    console.log('[seed:orders:extended] Sin SEED_USER_EMAIL, se omite.');
    return;
  }

  const users = await dataSource.query<{ id: string }[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (users.length === 0) {
    console.log('[seed:orders:extended] No existe usuario seed, se omite.');
    return;
  }

  const userId = users[0].id;

  const existing = await dataSource.query<{ c: string }[]>(
    "SELECT COUNT(*) AS c FROM orders WHERE assigned_user_id = ? AND notas_pedido LIKE '[seed-extra]%'",
    [userId],
  );

  if (asCount(existing) > 0) {
    console.log('[seed:orders:extended] Pedidos extra ya existen, se omite.');
    return;
  }

  for (const order of EXTRA_ORDERS) {
    const customerInsert = await dataSource.query(
      `INSERT INTO customers (nombre, telefono, direccion_entrega, created_at, updated_at)
       VALUES (?, ?, ?, NOW(3), NOW(3))`,
      [order.customerName, order.phone, order.address],
    );

    const customerId = insertId(customerInsert);

    await dataSource.query(
      `INSERT INTO orders (customer_id, assigned_user_id, estado, notas_pedido, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(3), NOW(3))`,
      [customerId, userId, order.status, order.notes],
    );
  }

  console.log('[seed:orders:extended] Se insertaron 4 pedidos extra de prueba.');
}

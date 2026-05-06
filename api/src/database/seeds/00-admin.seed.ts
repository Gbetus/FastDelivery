import * as bcrypt from 'bcrypt';
import type { SeedContext } from './types';

const BCRYPT_ROUNDS = 10;

export async function seedAdmin(ctx: SeedContext): Promise<void> {
  const { dataSource, config } = ctx;

  const adminEmail = (config.get<string>('ADMIN_USER_EMAIL') ?? 'admin@fastdelivery.local')
    .trim()
    .toLowerCase();
  const adminPassword = config.get<string>('ADMIN_USER_PASSWORD') ?? 'AdminPassword';
  const adminName = config.get<string>('ADMIN_USER_NAME') ?? 'Admin FastDelivery';

  const existingAdmin = await dataSource.query<{ id: string }[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [adminEmail],
  );

  if (existingAdmin.length > 0) {
    console.log(`[seed:admin] Ya existe admin con email ${adminEmail}, se omite insercion.`);
    return;
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
  await dataSource.query(
    `INSERT INTO users (email, password_hash, nombre, role, created_at, updated_at)
     VALUES (?, ?, ?, 'ADMIN', NOW(3), NOW(3))`,
    [adminEmail, adminPasswordHash, adminName],
  );

  console.log(`[seed:admin] Admin creado: ${adminEmail}`);
}

import * as bcrypt from 'bcrypt';
import type { SeedContext } from './types';

const BCRYPT_ROUNDS = 10;

export async function seedUsers(ctx: SeedContext): Promise<void> {
  const { dataSource, config } = ctx;

  const email = config.get<string>('SEED_USER_EMAIL');
  const plainPassword = config.get<string>('SEED_USER_PASSWORD');
  const name = config.get<string>('SEED_USER_NAME') ?? 'Seed User';

  if (!email?.trim() || !plainPassword) {
    throw new Error(
      'SEED_USER_EMAIL y SEED_USER_PASSWORD son obligatorios cuando SEED_ENABLED=true',
    );
  }

  const existing = await dataSource.query<{ id: string }[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email.trim().toLowerCase()],
  );

  if (existing.length > 0) {
    console.log(`[seed:users] Ya existe usuario con email ${email}, se omite inserción.`);
  } else {
    const passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

    await dataSource.query(
      `INSERT INTO users (email, password_hash, nombre, role, created_at, updated_at)
       VALUES (?, ?, ?, 'DELIVERER', NOW(3), NOW(3))`,
      [email.trim().toLowerCase(), passwordHash, name],
    );

    console.log(`[seed:users] Usuario creado: ${email}`);
  }

}

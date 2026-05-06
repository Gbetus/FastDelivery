import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { SEEDS } from '../src/database/seeds';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const enabled = config.get<string>('SEED_ENABLED') === 'true';

  if (!enabled) {
    console.log('[seed] SEED_ENABLED no es "true". No se ejecuta ningún seed.');
    await app.close();
    process.exit(0);
    return;
  }

  const dataSource = app.get(DataSource);
  const ctx = { dataSource, config };

  console.log('[seed] Inicio…');

  for (const seed of SEEDS) {
    await seed(ctx);
  }

  console.log('[seed] Completado.');
  await app.close();
  process.exit(0);
}

bootstrap().catch((err: unknown) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});

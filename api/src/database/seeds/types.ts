import type { DataSource } from 'typeorm';
import type { ConfigService } from '@nestjs/config';

export interface SeedContext {
  dataSource: DataSource;
  config: ConfigService;
}

export type SeedFn = (ctx: SeedContext) => Promise<void>;

import type { SeedFn } from './types';
import { seedAdmin } from './00-admin.seed';
import { seedUsers } from './01-users.seed';
import { seedCustomersAndOrders } from './02-customers-and-orders.seed';
import { seedExtendedOrders } from './03-orders-extended.seed';

export const SEEDS: SeedFn[] = [seedAdmin, seedUsers, seedCustomersAndOrders, seedExtendedOrders];

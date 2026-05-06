import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Order } from '../orders/entities/order.entity';
import { InitialSchema1738789200000 } from './migrations/1738789200000-InitialSchema';
import { AddUserRole1738789300000 } from './migrations/1738789300000-AddUserRole';

dotenv.config({ path: join(__dirname, '../../.env') });

export default new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Customer, Order],
  migrations: [InitialSchema1738789200000, AddUserRole1738789300000],
  migrationsTableName: 'typeorm_migrations',
});

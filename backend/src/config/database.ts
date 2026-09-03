import knex, { Knex } from 'knex';
import { env } from './env';

/**
 * Knex database configuration.
 * Knex is a SQL query builder that provides:
 * - Parameterized queries (SQL injection protection)
 * - Migration system for schema management
 * - Connection pooling
 * - Multi-database support (PostgreSQL, MySQL, SQLite)
 */
const knexConfig: Knex.Config = {
  client: env.DB_CLIENT,
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './src/models/migrations',
    tableName: 'knex_migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/models/seeds',
    extension: 'ts',
  },
};

/** Singleton database connection instance */
const db: Knex = knex(knexConfig);

export { db, knexConfig };
export default db;

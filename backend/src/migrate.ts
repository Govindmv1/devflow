import db from './config/database';
import { logger } from './utils';
import path from 'path';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    // Dynamically check if we are running the compiled JS or the source TS
    const isCompiled = __filename.endsWith('.js');
    const migrationsDir = isCompiled 
      ? path.join(__dirname, 'models', 'migrations')
      : path.join(__dirname, 'models', 'migrations');
    
    // In compiled dist, directory is actually dist/models/migrations, and source is src/models/migrations.
    // Since __dirname resolves to dist/ or src/ respectively, we can just use path.join(__dirname, 'models', 'migrations')!
    const extension = isCompiled ? 'js' : 'ts';

    logger.info(`Migration config: directory=${migrationsDir}, extension=${extension}`);

    const [batchNo, log] = await db.migrate.latest({
      directory: migrationsDir,
      extension: extension,
    });
    
    if (log.length === 0) {
      logger.info('Database is already up to date.');
    } else {
      logger.info(`Migrations completed successfully (Batch ${batchNo}).`);
      log.forEach((file: string) => logger.info(`- Applied: ${file}`));
    }
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed', { error: error instanceof Error ? error.stack : String(error) });
    process.exit(1);
  }
}

runMigrations();

import db from './config/database';
import { logger } from './utils';
import path from 'path';

async function runSeeds() {
  try {
    logger.info('Starting database seeding...');
    
    const isCompiled = __filename.endsWith('.js');
    const seedsDir = path.join(__dirname, 'models', 'seeds');
    const extension = isCompiled ? 'js' : 'ts';

    logger.info(`Seeding config: directory=${seedsDir}, extension=${extension}`);

    const [log] = await db.seed.run({
      directory: seedsDir,
      extension: extension,
    });
    
    logger.info('Database seeding completed successfully.');
    log.forEach((file: string) => logger.info(`- Seeded: ${file}`));
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed', { error: error instanceof Error ? error.stack : String(error) });
    process.exit(1);
  }
}

runSeeds();

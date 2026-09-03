import app from './app';
import { env } from './config';
import { db } from './config/database';
import { logger } from './utils';

/**
 * Server entry point.
 * Tests database connectivity before starting the HTTP server.
 */
async function startServer(): Promise<void> {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    logger.info('Database connected successfully');

    // Start the HTTP server
    app.listen(env.PORT, () => {
      logger.info(`DevFlow API server running on port ${env.PORT}`, {
        environment: env.NODE_ENV,
        aiEnabled: env.AI_ENABLED,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

// Handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection', { message: reason?.message, stack: reason?.stack });
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { message: error.message, stack: error.stack });
  process.exit(1);
});

startServer();

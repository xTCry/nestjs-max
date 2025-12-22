import './env';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
}
bootstrap();

// It's better to let the process finish.
// The restart must be in docker or another process manager.

const logger = new Logger('GlobalErrorHandler');
process.on('uncaughtException', (error: Error, origin: string) => {
  logger.error(`Uncaught Exception: ${error.message}`, error.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error(
    `Unhandled Rejection at: ${promise}, reason: ${reason?.message || reason}`,
    reason?.stack,
  );
  process.exit(1);
});

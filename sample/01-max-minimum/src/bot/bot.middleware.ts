import { OnModuleInit } from '@nestjs/common';
import { MaxMiddleware } from 'nestjs-max';
import { Composer, Context, MiddlewareFn, MiddlewareObj } from 'max-io';

import * as fs from 'fs/promises';
import * as path from 'path';

const LOGS_DIR = './logs-bot';

@MaxMiddleware()
export class BotMiddleware<Ctx extends Context = Context>
  implements MiddlewareObj<Ctx>, OnModuleInit
{
  // * Example of simple middleware
  // middleware(): MiddlewareFn<Ctx> {
  //   return async (context, next) => {
  //     console.log('[BotMiddleware] UpdateType:', context.updateType);
  //     await next();
  //   };
  // }

  // * Example of middleware with composer

  private readonly composer = new Composer();

  middleware(): MiddlewareFn<Ctx> {
    return this.composer.middleware();
  }

  async onModuleInit() {
    this.composer.use(this.loggerMW);

    await fs.mkdir(LOGS_DIR, { recursive: true });
  }

  private get loggerMW() {
    // Loggin all updates to file
    const logIt: MiddlewareFn<Context> = async (ctx, next) => {
      // Run next without awaiting
      next();
      await this.logToJsonFile({ update: ctx.update }, ctx.botInfo!.username!);
    };
    return logIt;
  }

  private async logToJsonFile<T>(data: T, filenamePrefix: string = 'log') {
    const now = new Date();

    const dateStr = now.toISOString().split('T')[0];
    const filename = `${filenamePrefix}-${dateStr}.jsonl`;
    const filepath = path.join(LOGS_DIR, filename);

    const logEntry = { timestamp: now.toISOString(), data };

    const line = JSON.stringify(logEntry) + '\n';

    await fs.appendFile(filepath, line, 'utf-8');
  }
}

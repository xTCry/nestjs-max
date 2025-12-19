import { Logger } from '@nestjs/common';
import { Bot } from '@maxhub/max-bot-api';

import { MaxBotApi, MaxModuleOptions } from '../interfaces';

export async function createBotFactory(
  options: MaxModuleOptions,
): Promise<Bot> {
  const bot = new Bot(options.token, options.config);

  if (options.useCatchLogger !== false) {
    bot.catch((err, ctx) => {
      if (err instanceof Error) {
        const logger = new Logger();
        const errorLog = options.useCatchLogger || logger.error.bind(logger);
        errorLog(
          `OnUpdateType(${ctx?.updateType}): ${err.message}`,
          err.stack,
          `MaxBot(${ctx.botInfo?.username ?? ''})`,
        );
      }
    });
  }

  if (options.launchOptions !== false) {
    // ? catch error of `api.getMyInfo` in start?
    bot.start(options.launchOptions as MaxBotApi.LaunchOptions);
  }

  return bot;
}

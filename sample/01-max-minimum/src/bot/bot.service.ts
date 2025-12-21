import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MaxInjectBot } from 'nestjs-max';
import { Bot, Context } from '@maxhub/max-bot-api';

import { BotRunner } from './bot-runner.util';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);

  private runner?: BotRunner;

  constructor(
    @MaxInjectBot()
    private readonly bot: Bot,
  ) {}

  async onModuleInit() {
    this.launch();
  }

  private get onFail() {
    return async (err: Error, ctx?: Context) => {
      if (ctx) {
        this.logger.warn('Возникла ошибка в LongPoll');
        this.logger.error(
          `OnUpdateType(${ctx?.updateType}): ${err}`,
          err.stack,
        );
      } else {
        this.logger.error('Longpoll crash', err.stack);
      }
    };
  }
  public async launch() {
    this.bot.catch(this.onFail);

    if (!this.runner) {
      this.runner = new BotRunner(
        {
          startFn: () => this.bot.start(),
          onRestartFn: () => this.bot.stop(),
          onError: (err) => this.onFail(err as Error),
        },
        { minDelayMs: 3e3, maxDelayMs: 30e3, autoStop: true },
      );
    }

    try {
      // this.bot.start().catch(this.onFail);
      this.runner.start();
      this.logger.log('🚀 Launch');
      await this.bot.api.setMyCommands([
        { name: '/start', description: 'Start menu' },
        { name: '/broke', description: 'Break bot' },
        { name: '/test abc 123', description: 'Test args' },
      ]);
    } catch (err) {
      this.logger.error('BotStaring error', err.stack);
    }
  }
}

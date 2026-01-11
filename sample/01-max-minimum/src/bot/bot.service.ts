import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MaxInjectBot } from 'nestjs-max';
import { Bot, Context } from 'max-io';
import { SendMessageExtra } from 'max-io/lib/core/network/api';

import { MAX_BOT_ADMIN_IDS } from '../env';
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
      await this.notifyAdmin('🚀 BotServer is running');
    } catch (err) {
      this.logger.error('BotStaring error', err.stack);
    }
  }

  async onApplicationShutdown(signal: string) {
    this.notifyAdmin(`⚠️ BotServer shutdown [${signal}]`);
  }

  public async notifyAdmin(message: string, extra: SendMessageExtra = {}) {
    for (const userId of MAX_BOT_ADMIN_IDS) {
      await this.bot.api.sendMessageToUser(userId, message, {
        format: 'html',
        notify: false,
        ...extra,
      });
    }
  }
}

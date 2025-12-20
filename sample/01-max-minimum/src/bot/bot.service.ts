import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MaxInjectBot } from 'nestjs-max';
import { Bot, Context } from '@maxhub/max-bot-api';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @MaxInjectBot()
    private readonly bot: Bot,
  ) {}

  async onModuleInit() {
    this.bot.catch(this.onFail);
    this.launch().catch(this.onFail);
  }

  private get onFail() {
    return async (err: Error, ctx?: Context) => {
      if (ctx) {
        this.logger.warn('Возникла ошибка в LongPoll', ctx.update);
      }
      this.logger.error(err);

      // TODO: safe relaunch if need
    };
  }

  public async launch() {
    this.bot.start().catch(this.onFail);
    this.logger.log('🚀 Launch');
    await this.bot.api.setMyCommands([
      { name: '/start', description: 'Start menu' },
      { name: '/broke', description: 'Break bot' },
      { name: '/test abc 123', description: 'Test args' },
    ]);
  }
}

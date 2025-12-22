import { Module } from '@nestjs/common';
import { MaxModule } from 'nestjs-max';

import { MAXIMUM_BOT_TOKEN } from '../env';
import { BotMiddleware } from './bot.middleware';
import { BotService } from './bot.service';
import { BotAdminUpdate } from './updates/bot-admin.update';
import { BotMainUpdate } from './updates/bot-main.update';
import { BotUserUpdate } from './updates/bot-user.update';

@Module({
  imports: [
    MaxModule.forRoot({
      token: MAXIMUM_BOT_TOKEN,
      // include: [TestModule],
      launchOptions: false,
      replyOptions: { markup: 'html' },
      // useDebugInfo: true,
      middlewaresBefore: [
        async function MWBefore(_ctx, next) {
          console.log('• [MW] Before.');
          await next();
        },
      ],
      middlewaresAfter: [
        async function MWAfter(_ctx, next) {
          console.log('• [MW] After.');
          await next();
        },
      ],
    }),
  ],
  providers: [
    BotService,
    BotMiddleware,
    // Updates (listener priority)
    BotAdminUpdate,
    BotUserUpdate,
    BotMainUpdate,
  ],
})
export class BotModule {}

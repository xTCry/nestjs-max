import { Module } from '@nestjs/common';
import { MaxModule } from 'nestjs-max';

import { BotMiddleware } from './bot.middleware';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    MaxModule.forRoot({
      token: process.env.MAXIMUM_BOT_TOKEN!,
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
  providers: [BotService, BotUpdate, BotMiddleware],
})
export class BotModule {}

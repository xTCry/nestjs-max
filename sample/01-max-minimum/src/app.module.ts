import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { BotModule } from './bot/bot.module';
import { RolesGuard } from './common/guard/admin.guard';

@Module({
  imports: [BotModule],
  providers: [
    // set global guard
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

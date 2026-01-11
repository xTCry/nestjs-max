import { Logger, UseFilters } from '@nestjs/common';
import {
  BotResponse,
  Command,
  Ctx,
  Hears,
  MaxReplyOptions,
  MaxStarted,
  MaxUpdate,
  Next,
} from 'nestjs-max';
import { Keyboard, type NextFn } from 'max-io';

import {
  AllowedRoles,
  AllowedRolesSilent,
  AnyRoles,
  MaxExceptionFilter,
  UserException,
  UserRole,
} from '../../common';
import { IMessageContext } from '../../types';

@MaxUpdate()
@MaxReplyOptions({ markup: 'html' })
@UseFilters(MaxExceptionFilter)
@AllowedRoles(UserRole.ADMIN)
export class BotAdminUpdate {
  private readonly logger = new Logger(BotAdminUpdate.name);

  @MaxStarted()
  onStarted() {
    this.logger;
    return 'HelloW! Use /start (or xstart or .start or 0start)';
  }

  @Command('start')
  @AllowedRolesSilent() // auto skip (next)
  @MaxReplyOptions({ replyTo: true })
  async onStartCommand(@Ctx() ctx: IMessageContext): Promise<BotResponse> {
    const keyboard = Keyboard.inlineKeyboard([
      [Keyboard.button.callback('default', 'color:default')],
    ]);

    return {
      text: 'Hello, admin!',
      keyboard,
    };
  }

  @Command('admin')
  async onAdminCheck(ctx: IMessageContext, next: NextFn) {
    await ctx.reply('Admin ✔');
    await next(); // for "main" listener
  }

  @Command('admins')
  @AllowedRolesSilent() // auto skip (next)
  onAdminCheckSilent(@Next() next: NextFn) {
    next();
    return 'Admin ✔😶';
  }

  @AnyRoles()
  @Command('user')
  onUser() {
    return 'User from AdminUpdate';
  }

  @Hears(/^\/broke/i)
  @AllowedRolesSilent() // auto skip (next)
  onBroke(@Ctx() ctx: IMessageContext) {
    throw new UserException(
      `Test error for admin on "${ctx.message!.body.text}"`,
    );
  }
}

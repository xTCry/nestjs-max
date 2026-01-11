import { UseFilters } from '@nestjs/common';
import {
  BotResponse,
  Command,
  Ctx,
  Hears,
  MaxReplyOptions,
  MaxUpdate,
  Next,
} from 'nestjs-max';
import { type NextFn } from 'max-io';

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
@AllowedRoles(UserRole.USER)
export class BotUserUpdate {
  // Будет вызвана, если user имеет роль Admin (выполнится `next()`).
  // Если user не имеет роли Admin, в `BotAdminUpdate` сразу отправит ошибку доступа, т.к.не установлен декоратор `@AllowedRolesSilent()`
  // Если user не имеет роли User, то в этом месте будет выведена ошибка. `next()` не будет вызван
  @Command('admin')
  async onAdminCheck(ctx: IMessageContext, next: NextFn) {
    await ctx.reply('User ✔');
    await next(); // for "main" listener
  }

  @Command('admins')
  @AllowedRolesSilent() // auto skip (next)
  onAdminCheckSilent(@Next() next: NextFn): BotResponse {
    next();
    return 'User ✔😶';
  }

  // ! не будет вызвана, т.к. в `BotAdminUpdate` установлен декоратор `@AnyRoles()` и ошибки не будет
  // Для дальнейшего перехода по композиции можно вызвать `next()` в `BotAdminUpdate`
  @AnyRoles()
  @Command('user')
  onUser() {
    return 'User from UserUpdate';
  }

  @Hears(/^\/broke/i)
  @AllowedRolesSilent() // auto skip (next)
  onBroke(@Ctx() ctx: IMessageContext) {
    throw new UserException(
      `Test error for user on "${ctx.message!.body.text}"`,
    );
  }
}

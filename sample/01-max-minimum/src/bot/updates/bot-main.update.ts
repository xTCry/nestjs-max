import { Logger, UseFilters } from '@nestjs/common';
import {
  Action,
  BotResponse,
  Command,
  Ctx,
  Hears,
  MaxReplyOptions,
  MaxStarted,
  MaxStartPayload,
  MaxUpdate,
  Next,
  On,
  Use,
} from 'nestjs-max';
import { Keyboard, type NextFn, StickerAttachment } from '@maxhub/max-bot-api';
import type {
  BotStartedUpdate,
  MessageCallbackUpdate,
} from '@maxhub/max-bot-api/dist/core/network/api';

import {
  AnyRoles,
  MaxExceptionFilter,
  UpdateType,
  UserException,
} from '../../common';
import { IContext, IMessageContext } from '../../types';

@MaxUpdate()
// @MaxReplyOptions({ markup: 'html' })
@UseFilters(MaxExceptionFilter)
export class BotMainUpdate {
  private readonly logger = new Logger(BotMainUpdate.name);

  @Use()
  async onUse(
    @Ctx() ctx: IContext,
    @Next() next: NextFn,
    @UpdateType() updateType: string,
  ) {
    this.logger.log(
      '[onUse]:' +
        JSON.stringify({
          type: ctx.update.update_type,
          match: ctx.update.update_type === updateType,
        }),
    );

    try {
      await next?.();
      this.logger.debug('[onUse] END');
    } catch (err) {
      this.logger.error('[onUse] ERROR', err);
      throw err; // Rethrow
    }
  }

  @MaxStarted()
  onStarted(
    @Ctx() ctx: IContext<BotStartedUpdate>,
    @Next() next: NextFn,
    @MaxStartPayload() payload?: string | null,
  ) {
    console.log('[onStarted] Info: ', {
      startPayload: ctx.startPayload,
      payloadByDecorator: payload,
      match: ctx.startPayload === payload,
    });

    next?.(); // for test middleware
    return 'HelloW!\nUse /start (or xstart or .start or 0start)\nUse /id for get user id';
  }

  @Command('start')
  @MaxReplyOptions({ replyTo: true })
  async onStartCommand(@Ctx() ctx: IMessageContext, @Next() next: NextFn) {
    console.log('[Command:Start]', ctx.message.body);
    next?.(); // for test middleware

    const keyboard = Keyboard.inlineKeyboard([
      [
        Keyboard.button.callback('default', 'color:default'),
        Keyboard.button.callback('positive', 'color:positive', {
          intent: 'positive',
        }),
        Keyboard.button.callback('negative', 'color:negative', {
          intent: 'negative',
        }),
      ],
      [Keyboard.button.link('Открыть MAX', 'https://max.ru')],
      [
        Keyboard.button.chat('Новый чат', 'Это чат.', {
          chat_description: 'Описание чата',
          start_payload: 'payloadIt',
        }),
      ],
    ]);

    await ctx.reply(
      'Okky. Run <pre>/BroKe</pre> to test error; run <code>/test arg1    -arg2</code>',
      { format: 'html', attachments: [keyboard] },
    );
  }

  @Hears('id')
  @Command('id')
  onId(ctx: IMessageContext): BotResponse {
    return `<b>UserID:</b> <i><code>${ctx.message.sender!.user_id}</code></i>`;
  }

  // Будет вызвана, если user имеет роль Admin и User (выполнится `next()` в `BotAdminUpdate` и `BotUserUpdate`).
  // Если user не имеет роли Admin и User, в `BotAdminUpdate` или `BotUserUpdate` сразу отправит ошибку доступа, т.к. не установлен декоратор `@AllowedRolesSilent()`
  @Command('admin')
  onAdminCheck() {
    return 'Admin or User ?';
  }

  @Command('admins')
  onAdminCheckSilent() {
    return 'Admin ?😶';
  }

  // ! не будет вызвана, т.к. в `BotAdminUpdate` установлен декоратор `@AnyRoles()` и ошибки не будет
  // Для дальнейшего перехода по композиции можно вызвать `next()` в `BotAdminUpdate` и `BotUserUpdate`
  @AnyRoles()
  @Command('user')
  onUser() {
    return 'User from MainUpdate';
  }

  @Command('bb')
  @MaxReplyOptions({ markup: 'markdown' })
  onBB(): BotResponse {
    return '**Bold**; _Italic_; _**Bold Italic**_; `Code`; [Link](https://max.ru); ~~Strikethrough~~';
  }

  @Hears(/\/test( .*)?/)
  @MaxReplyOptions({ replyTo: true })
  async onTestCommand(
    @Ctx() ctx: IMessageContext,
    @Next() next: NextFn,
  ): Promise<BotResponse> {
    const text = ctx.message.body.text!;
    const [, ...args] = text.split(' ').filter(Boolean);

    console.log('[Hears:Cmd] Test', ctx.message.body, { args });
    next?.(); // for test middleware
    if (args.length === 0) {
      return;
    }

    const keyboard = Keyboard.inlineKeyboard([
      [Keyboard.button.requestContact('Contact me')],
    ]);

    // ctx.api.raw.messages.send({
    //   chat_id: ctx.chatId,
    //   attachments: [new StickerAttachment({ code: '34bd4fbb' }).toJson()],
    // });
    // ↓

    return {
      attachments: [
        keyboard,
        new StickerAttachment({ code: '34bd4fbb' }).toJson(),
      ],
    };
  }

  @Action(/color:(.+)/i)
  async onActionColor(
    @Ctx() ctx: IContext<MessageCallbackUpdate>,
  ): Promise<BotResponse> {
    const color = ctx.match![1];
    this.logger.debug(`Color: [${color}]`);

    const colors = ['default', 'positive', 'negative'] as const;
    const keyboard = Keyboard.inlineKeyboard([
      colors.map((c) =>
        Keyboard.button.callback(
          `${c}${color === c ? ' ✅' : ''}`,
          `color:${c}`,
          { intent: c },
        ),
      ),
    ]);
    await ctx.answerOnCallback({
      message: {
        text: `Your choice: ${color} color`,
        // attachments: [keyboard],
      },
      notification: Math.random() > 0.7 ? '!WoW!' : null,
    });
    return { editIt: true, keyboard };
  }

  @Hears(/^\/broke/i)
  onBroke(@Ctx() ctx: IMessageContext) {
    throw new UserException(`Test error on "${ctx.message.body.text}"`);
  }

  // @MaxReplyOptions({ replyTo: true })
  // @On('message_edited')
  // async onMsgEdited(): Promise<BotResponse> {
  //   return 'I see that 👀...';
  // }
  // ↓

  @On('message_edited')
  async onMsgEdited(): Promise<BotResponse> {
    return { text: 'I see that 👀...', replyTo: true };
  }

  @Hears(/^a/i)
  async onA(@Ctx() ctx: IMessageContext): Promise<BotResponse> {
    const msg = await ctx.reply('see it', {
      link: { type: 'reply', mid: ctx.messageId! },
    });
    return `MID: <code>${msg.body.mid}</code>`;
  }

  @Hears(/^(?<m1>mid.[0-9a-f]{32})/i)
  async onMid(@Ctx() ctx: IMessageContext): Promise<BotResponse> {
    const midTarget = ctx.match!.groups!.m1!;

    await ctx.api.editMessage(midTarget, {
      text: 'MID: ' + midTarget + ' [edited]',
    });
    return 'done';
  }

  @On('message_created')
  async onMsgCreated(@Next() next: NextFn, @Ctx() ctx: IMessageContext) {
    // Executed it if `next()` called on previous stages or not catched
    console.log('[onMsgCreated]:', { ctx: typeof ctx, next: typeof next });
    await next?.(); // for test middleware
    if (ctx.message.body.text === 'broke') {
      throw new Error('test it');
    }
  }
}

import { Logger, UseFilters } from '@nestjs/common';
import {
  Action,
  Command,
  Ctx,
  Hears,
  MaxReplyOptions,
  MaxStart,
  MaxStartPayload,
  MaxUpdate,
  Next,
  On,
  Use,
} from 'nestjs-max';
import {
  type Context as IContext,
  Keyboard,
  type NextFn,
  StickerAttachment,
} from '@maxhub/max-bot-api';
import type {
  BotStartedUpdate,
  MessageCallbackUpdate,
  MessageCreatedUpdate,
  Update,
} from '@maxhub/max-bot-api/dist/core/network/api';

import { MaxExceptionFilter, UpdateType, UserException } from '../common';

@MaxUpdate()
// @MaxReplyOptions({ markup: 'html' })
@UseFilters(MaxExceptionFilter)
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  @Use()
  async onUse(
    @Ctx() ctx: IContext<Update>,
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

  @MaxStart()
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
    return 'HelloW! Use /start (or xstart or .start or 0start)';
  }

  @Command('start')
  @MaxReplyOptions({ replyTo: true })
  async onStartCommand(
    @Ctx() ctx: IContext<MessageCreatedUpdate>,
    @Next() next: NextFn,
  ) {
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

  @Command('bb')
  @MaxReplyOptions({ markup: 'markdown' })
  onBB() {
    return '**Bold**; _Italic_; `Code`; [Link](https://max.ru); ~~Strikethrough~~';
  }

  @Hears(/\/test( .*)?/)
  @MaxReplyOptions({ replyTo: true })
  onTestCommand(
    @Ctx() ctx: IContext<MessageCreatedUpdate>,
    @Next() next: NextFn,
  ) {
    const text = ctx.message.body.text!;
    const [, ...args] = text.split(' ').filter(Boolean);

    console.log('[Hears:Cmd] Test', ctx.message.body, { args });
    next?.(); // for test middleware
    if (args.length === 0) {
      return;
    }
    ctx.api.raw.messages.send({
      chat_id: ctx.chatId,
      attachments: [new StickerAttachment({ code: '34bd4fbb' }).toJson()],
    });
  }

  @Action(/color:(.+)/i)
  async onActionColor(@Ctx() ctx: IContext<MessageCallbackUpdate>) {
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
        attachments: [keyboard],
      },
      notification: '!WoW!',
    });
  }

  @Hears(/^\/broke/i)
  onBroke(@Ctx() ctx: IContext<MessageCreatedUpdate>) {
    throw new UserException(`Test error on "${ctx.message.body.text}"`);
  }

  @On('message_edited')
  async onMsgEdited() {
    return 'I see that 👀...';
  }

  @On('message_created')
  async onMsgCreated(
    @Next() next: NextFn,
    @Ctx() ctx: IContext<MessageCreatedUpdate>,
  ) {
    // Executed it if `next()` called on previous stages or not catched
    console.log('[onMsgCreated]:', { ctx: typeof ctx, next: typeof next });
    await next?.(); // for test middleware
    if (ctx.message.body.text === 'broke') {
      throw new Error('test it');
    }
  }
}

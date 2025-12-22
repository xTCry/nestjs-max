import { Context } from '@maxhub/max-bot-api';
import type { AttachmentRequest } from '@maxhub/max-bot-api/dist/core/network/api';

import {
  BotResponse,
  BotResponseObj,
  IMaxReplyOptions,
  Markup,
} from '../interfaces';

export type ParsedBotResponseObj = Omit<BotResponseObj, 'keyboard'>;

export function parseListenerResult(
  result: BotResponse,
): ParsedBotResponseObj | null {
  if (!result || typeof result !== 'object') return null;

  let editIt: boolean | undefined;
  let text: string | undefined;
  let markup: Markup | undefined;
  let replyTo: boolean | undefined;
  let notify: boolean | undefined;
  let disable_link_preview: boolean | undefined;
  let attachments: AttachmentRequest[] | null | undefined;

  if ('editIt' in result && typeof result.editIt === 'boolean')
    editIt = result.editIt;
  if ('text' in result && typeof result.text === 'string') text = result.text;
  if ('markup' in result && typeof result.markup === 'string')
    markup = result.markup as Markup;
  if ('notify' in result && typeof result.notify === 'boolean')
    notify = result.notify;
  if ('replyTo' in result && typeof result.replyTo === 'boolean')
    replyTo = result.replyTo;
  if (
    'disable_link_preview' in result &&
    typeof result.disable_link_preview === 'boolean'
  ) {
    disable_link_preview = result.disable_link_preview;
  }

  if ('attachments' in result && typeof result.attachments === 'object') {
    attachments =
      result.attachments && Array.isArray(result.attachments)
        ? result.attachments
        : null;
  }

  if (
    'keyboard' in result &&
    result.keyboard &&
    typeof result.keyboard === 'object'
  ) {
    const keyboard = result.keyboard;
    if (
      'type' in keyboard &&
      'payload' in keyboard &&
      keyboard.type === 'inline_keyboard'
    ) {
      if (attachments) attachments.push(keyboard);
      else attachments = [keyboard];
    }
  }

  return {
    editIt,
    text,
    markup,
    replyTo,
    notify,
    disable_link_preview,
    attachments,
  };
}

export async function applyIfObjResult(
  ctx: Context,
  objResult: ParsedBotResponseObj,
  replyOptions: IMaxReplyOptions,
) {
  const {
    text,
    markup,
    notify,
    replyTo,
    editIt,
    disable_link_preview,
    attachments,
  } = objResult;
  const format = markup || replyOptions.markup;

  if (!editIt && !text && attachments?.length === 0) {
    throw new Error('Need to set "text", "attachments" or "editIt"');
  }

  if (editIt) {
    await ctx.editMessage({
      text,
      format,
      // ...(replyOptions.replyTo && ctx.message
      //   ? { link: { type: 'reply', mid: ctx.message.body.mid } }
      //   : {}),
      notify,
      attachments,
    });
    return;
  }

  await ctx.reply(text || '', {
    format,
    ...((replyTo || replyOptions.replyTo) && ctx.message
      ? { link: { type: 'reply', mid: ctx.message.body.mid } }
      : {}),
    notify,
    disable_link_preview,
    attachments,
  });
}

export async function applyIfStringResult(
  ctx: Context,
  result: any,
  replyOptions: IMaxReplyOptions,
) {
  if (ctx.chatId === undefined) return;
  if (typeof result !== 'string' || result.length === 0) return;

  await ctx.reply(result, {
    format: replyOptions.markup,
    ...(replyOptions.replyTo && ctx.message
      ? { link: { type: 'reply', mid: ctx.message.body.mid } }
      : {}),
  });
}

export async function applyListenerResult(
  ctx: Context,
  result: BotResponse,
  replyOptions: IMaxReplyOptions,
) {
  const objResult = parseListenerResult(result);
  if (objResult) await applyIfObjResult(ctx, objResult, replyOptions);
  else await applyIfStringResult(ctx, result, replyOptions);
}

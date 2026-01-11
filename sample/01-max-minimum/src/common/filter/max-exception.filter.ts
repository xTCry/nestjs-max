import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import {
  MaxArgumentsHost,
  MaxException,
  MaxExecutionContext,
} from 'nestjs-max';
import { MaxError } from 'max-io';

import { MAX_BOT_ADMIN_IDS } from '../../env';
import { UserException } from '../exception/user.exception';

@Catch()
export class MaxExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MaxExceptionFilter.name);

  async catch(exception: Error, host: MaxExecutionContext) {
    if (host.getType() !== 'mmax') {
      // throw exception;
      return;
    }

    const maxHost = MaxArgumentsHost.create(host);
    const ctx = maxHost.getContext();
    const next = maxHost.getNext();

    if (
      !['NO_ACCESS', 'SKIP', 'SKIP_FULL'].includes(exception.message) &&
      !(exception instanceof UserException)
      // && !(exception instanceof MaxError && exception.status === 403)
    ) {
      this.logger.error(
        `OnUpdateType(${ctx?.updateType})${exception instanceof MaxError ? `[${exception.code}]` : ''}: ${exception?.message || exception}`,
        exception.stack,
      );
    }

    if (!(exception instanceof Error) || !ctx) {
      return;
    }

    if (
      exception instanceof MaxException &&
      (exception.message === 'SKIP_FULL' || exception.message === 'SKIP')
    ) {
      await next();
      return;
    }

    let content = 'Error';
    const isAdmin = ctx.user && MAX_BOT_ADMIN_IDS.includes(ctx.user.user_id);

    switch (true) {
      case exception instanceof UserException:
        content = ctx.callback
          ? `💢 Error: ${escapeHTMLCodeChars(exception.message)}`
          : `💢 Error: <b>${escapeHTMLCodeChars(exception.message)}</b>`;
        break;
      case exception instanceof MaxException &&
        exception.message === 'NO_ACCESS':
        content = 'No Access 🚫';
        break;
      // case exception instanceof MaxException &&
      //   exception.message === 'SKIP_FULL':
      //   // no send any message
      //   return;
      // case exception instanceof MaxException && exception.message === 'SKIP':
      //   content = '⚡️';
      //   break;

      case isAdmin:
        content = ctx.callback
          ? `💢 Error: ${escapeHTMLCodeChars(exception.message)}`
          : `💢 Error: <b>${escapeHTMLCodeChars(exception.message)}</b>` +
            (exception.stack
              ? `\n<code>${escapeHTMLCodeChars(
                  exception.stack.split('\n').slice(0, 5).join('\n'),
                )}</code>`
              : '');
        break;

      default:
        content = 'Произошла ошибка';
        break;
    }

    if (exception instanceof MaxError) {
      // TODO:
      // if (
      //   exception.description.includes('bot was blocked by the user') ||
      //   exception.description.includes('user is deactivated') ||
      //   exception.description.includes('chat not found')
      // ) {
      //   // ...
      //   return;
      // }
    }

    try {
      if (ctx.callback) {
        await ctx.answerOnCallback({
          message: { text: content, notify: false },
          notification: 'Failed ⚠',
        });
      } else if (ctx.message) {
        await ctx.reply(
          content,
          ctx.message.body.mid
            ? {
                link: { type: 'reply', mid: ctx.message.body.mid },
                format: 'html',
              }
            : {},
        );
      }
    } catch (err) {
      console.error('fail reply:', err);
    }
  }
}

export const escapeHTMLCodeChars = (text: string) =>
  text
    .replace(/</gi, '&lt;')
    .replace(/>/gi, '&gt;')
    .replace(/&/gi, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

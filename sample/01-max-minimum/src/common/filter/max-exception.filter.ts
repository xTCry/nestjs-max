import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { MaxArgumentsHost, MaxExecutionContext } from 'nestjs-max';
import { MaxError } from '@maxhub/max-bot-api';

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

    if (
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

    let content = 'Произошла ошибка';

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
    if (exception instanceof UserException) {
      content = ctx.callback
        ? `💢 Error: ${exception.message}`
        : `💢 Error: <b>${exception.message}</b>`;
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

import { ParamData } from '@nestjs/common';
import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator';
import { Context } from '@maxhub/max-bot-api';

import { MaxParamType } from './max-paramtype.enum';

export class MaxParamsFactory implements ParamsFactory {
  exchangeKeyForValue(
    type: MaxParamType,
    data: ParamData,
    args: unknown[],
  ): unknown {
    if (!args) return null;

    const [ctx, next] = args as [Context, Function];
    data;

    switch (type) {
      case MaxParamType.CONTEXT:
        return ctx;
      case MaxParamType.NEXT:
        return next;
      case MaxParamType.MESSAGE:
        return ctx.message;
      default:
        return null;
    }
  }
}

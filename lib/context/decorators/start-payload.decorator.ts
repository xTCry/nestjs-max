import { createParamDecorator } from '@nestjs/common';

import { MaxStart } from '../../decorators';
import { MaxExecutionContext } from '../max-execution-context';

export { MaxStart };

/**
 * Get start payload `string | null | undefined`
 *
 * Only by {@link MaxStart} `@MaxStart()` decorator (on `bot_started` update type)
 */
export const MaxStartPayload = createParamDecorator(
  (_, ctx) => MaxExecutionContext.create(ctx).getContext().startPayload,
);

/**
 * Alias for {@link MaxStartPayload}
 * @see {@link MaxStartPayload}
 */
export const StartPayload = MaxStartPayload;

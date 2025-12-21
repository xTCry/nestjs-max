import { createParamDecorator } from '@nestjs/common';

import { MaxStarted } from '../../decorators';
import { MaxExecutionContext } from '../max-execution-context';

export { MaxStarted };

/**
 * Get start payload `string | null | undefined`
 *
 * Only by {@link MaxStarted} `@MaxStart()` decorator (on `bot_started` update type)
 */
export const MaxStartPayload = createParamDecorator(
  (_, ctx) => MaxExecutionContext.create(ctx).getContext().startPayload,
);

/**
 * Alias for {@link MaxStartPayload}
 * @see {@link MaxStartPayload}
 */
export const StartPayload = MaxStartPayload;

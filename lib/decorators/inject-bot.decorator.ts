import { Inject } from '@nestjs/common';

import { getBotToken } from '../util';

export const MaxInjectBot = (botName?: string) => Inject(getBotToken(botName));

/**
 * Alias for {@link MaxInjectBot}
 */
export const InjectBot = MaxInjectBot;

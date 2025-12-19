import { ListenerDecorator } from '../../util';

export const MaxStart = () => ListenerDecorator('on')('bot_started');

/**
 * Alias for {@link MaxStart}
 */
export const Start = MaxStart;

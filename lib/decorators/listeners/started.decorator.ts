import { ListenerDecorator } from '../../util';

/**
 * Decorator to listen `bot_started` event
 */
export const MaxStarted = () => ListenerDecorator('on')('bot_started');

/**
 * Alias for {@link MaxStarted}
 */
export const Started = MaxStarted;

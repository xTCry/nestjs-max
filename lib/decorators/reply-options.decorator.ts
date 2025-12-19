import { Reflector } from '@nestjs/core';
import { IMaxReplyOptions } from '../interfaces';

export const MaxReplyOptions = Reflector.createDecorator<IMaxReplyOptions>({});

/**
 * Alias for {@link MaxReplyOptions}
 */
export const ReplyOptions = MaxReplyOptions;

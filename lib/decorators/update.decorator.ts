import { SetMetadata } from '@nestjs/common';

export const MMAX_UPDATE_METADATA = 'MMAX_UPDATE_METADATA';

/**
 * `@MaxUpdate` decorator, it's like NestJS `@Controller` decorator,
 * but for Max Bot API updates.
 */
export const MaxUpdate = () => SetMetadata(MMAX_UPDATE_METADATA, true);
MaxUpdate.KEY = MMAX_UPDATE_METADATA;

/**
 * Alias for {@link MaxUpdate}
 */
export const Update = MaxUpdate;

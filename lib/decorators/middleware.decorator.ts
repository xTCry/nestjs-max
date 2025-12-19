import { SetMetadata } from '@nestjs/common';

export const MMAX_MIDDLEWARE_METADATA = 'MMAX_MIDDLEWARE_METADATA';

export const MaxMiddleware = () => SetMetadata(MMAX_MIDDLEWARE_METADATA, true);
MaxMiddleware.KEY = MMAX_MIDDLEWARE_METADATA;

/**
 * Alias for {@link MaxMiddleware}
 */
export const Middleware = MaxMiddleware;

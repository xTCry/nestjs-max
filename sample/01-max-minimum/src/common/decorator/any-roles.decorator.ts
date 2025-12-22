import { SetMetadata } from '@nestjs/common';

export const IS_ANY_ROLES = 'isAnyRoles';

/**
 * Access will be for any roles
 */
export const AnyRoles = () => SetMetadata(IS_ANY_ROLES, true);

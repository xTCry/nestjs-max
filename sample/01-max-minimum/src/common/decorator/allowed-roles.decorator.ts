import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../constant';

export const ALLOWED_ROLES_KEY = 'ALLOWED_ROLES_KEY';
export const ALLOWED_ROLES_SILENT_KEY = 'ALLOWED_ROLES_SILENT_KEY';

/**
 * Allowed Access Roles
 */
export const AllowedRoles = (...allowedRoles: UserRole[]) =>
  SetMetadata(ALLOWED_ROLES_KEY, allowedRoles);

export const AllowedRolesSilent = (silent: boolean = true) =>
  SetMetadata(ALLOWED_ROLES_SILENT_KEY, silent);

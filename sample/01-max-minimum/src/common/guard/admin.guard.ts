import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MaxContextType, MaxException, MaxExecutionContext } from 'nestjs-max';

import { MAX_BOT_ADMIN_IDS, MAX_BOT_USER_IDS } from '../../env';
import { UserRole } from '../constant';
import {
  ALLOWED_ROLES_KEY,
  ALLOWED_ROLES_SILENT_KEY,
  IS_ANY_ROLES,
  MaxChatType,
  MMAX_ALLOWED_CHAT_TYPES_KEY,
} from '../decorator';

function toArr<T>(arr: T | T[]): T[] {
  return Array.isArray(arr) ? arr : [arr];
}

/**
 * Must be used in conjunction with the `@AllowedRoles` decorator
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const handler = context.getHandler();
    const controller = context.getClass();

    const targets = [handler, controller];
    const isAnyRoles = this.reflector.getAllAndOverride<boolean>(
      IS_ANY_ROLES,
      targets,
    );
    const allowedRoles = this.reflector.getAllAndMerge<UserRole[]>(
      ALLOWED_ROLES_KEY,
      targets,
    );
    const allowedRolesSilent = toArr(
      this.reflector.getAllAndMerge<boolean[]>(
        ALLOWED_ROLES_SILENT_KEY,
        targets,
      ),
    );

    if (context.getType<MaxContextType>() === 'mmax') {
      const eCtx = MaxExecutionContext.create(context);
      const ctx = eCtx.getContext();

      const allowedChatTypes = this.reflector.getAllAndMerge<MaxChatType[]>(
        MMAX_ALLOWED_CHAT_TYPES_KEY,
        [handler, controller],
      );

      if (
        ctx.chat?.type &&
        allowedChatTypes.length > 0 &&
        !allowedChatTypes.includes(ctx.chat.type) &&
        !allowedChatTypes.includes('any')
      ) {
        throw new MaxException('SKIP');
        // return true || null;
      }
    }

    if (!allowedRoles.length || isAnyRoles) {
      return true;
    }

    if (context.getType<MaxContextType>() === 'mmax') {
      const eCtx = MaxExecutionContext.create(context);
      const ctx = eCtx.getContext();
      if (
        !ctx.user ||
        (allowedRoles.includes(UserRole.ADMIN) &&
          !MAX_BOT_ADMIN_IDS.includes(ctx.user.user_id)) ||
        (allowedRoles.includes(UserRole.USER) &&
          !MAX_BOT_USER_IDS.includes(ctx.user.user_id))
        // ...
      ) {
        if (!allowedRolesSilent.some((e) => e === true)) {
          throw new MaxException('NO_ACCESS');
        }
        // return false;
        throw new MaxException('SKIP_FULL');
      }
      return true;
    }

    throw new ForbiddenException(
      'Could not authenticate with token or user does not have permissions',
    );
  }
}

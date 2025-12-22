import { SetMetadata } from '@nestjs/common';
import { ChatType } from '@maxhub/max-bot-api/dist/core/network/api';

export const MMAX_ALLOWED_CHAT_TYPES_KEY = 'MMAX_ALLOWED_CHAT_TYPES_KEY';

export type MaxChatType = 'any' | ChatType;

/**
 * [Max] Allowed chat types
 */
export const AllowedChatTypes = (...allowed: MaxChatType[]) =>
  SetMetadata(MMAX_ALLOWED_CHAT_TYPES_KEY, allowed);

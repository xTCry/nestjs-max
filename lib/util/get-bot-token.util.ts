import { MMAX_DEFAULT_BOT_NAME } from '../max.constants';

export function getBotToken(name?: string): string {
  return name && name !== MMAX_DEFAULT_BOT_NAME
    ? `${name}BotMMax`
    : MMAX_DEFAULT_BOT_NAME;
}

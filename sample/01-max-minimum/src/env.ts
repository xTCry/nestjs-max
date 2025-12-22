import 'dotenv/config';

export const MAXIMUM_BOT_TOKEN = process.env.MAXIMUM_BOT_TOKEN!;

if (!MAXIMUM_BOT_TOKEN) {
  throw new Error('[ENV] MAXIMUM_BOT_TOKEN is not defined');
}

// * For example user id:

export const MAX_BOT_ADMIN_IDS =
  process.env.MAX_BOT_ADMIN_IDS?.split(',').map(Number).filter(Boolean) || [];

export const MAX_BOT_USER_IDS =
  process.env.MAX_BOT_USER_IDS?.split(',').map(Number).filter(Boolean) || [];

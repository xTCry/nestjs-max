import type { AttachmentRequest } from '@maxhub/max-bot-api/dist/core/network/api';

export type Markup = 'html' | 'markdown';

export type BotResponseObj = {
  editIt?: boolean;
  text?: string;
  markup?: Markup;
  replyTo?: boolean;
  notify?: boolean;
  disable_link_preview?: boolean;
  attachments?: AttachmentRequest[] | null;
};

export type BotResponse = BotResponseObj | string | void | null | undefined;

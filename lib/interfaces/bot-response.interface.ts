import type {
  AttachmentRequest,
  InlineKeyboardAttachmentRequest,
} from '@maxhub/max-bot-api/dist/core/network/api';

export type Markup = 'html' | 'markdown';

export type BotResponseObj = {
  /** edit message */
  editIt?: boolean;
  text?: string;
  markup?: Markup;
  /** reply to target message */
  replyTo?: boolean;
  notify?: boolean;
  disable_link_preview?: boolean;
  attachments?: AttachmentRequest[] | null;
  /** add inline keyboard to attachments */
  keyboard?: InlineKeyboardAttachmentRequest | null;
};

export type BotResponse = BotResponseObj | string | void | null | undefined;

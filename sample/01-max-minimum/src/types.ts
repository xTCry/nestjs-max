import * as max from '@maxhub/max-bot-api/dist/types';
import { Context } from '@maxhub/max-bot-api';

export type IContext<U extends max.Update = max.Update> = Context<U>;

export type IMessageContext = IContext<
  max.MessageCreatedUpdate | max.MessageEditedUpdate
>;

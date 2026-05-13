import type { Context } from 'max-io';
import type * as max from 'max-io/types';

export type IContext<U extends max.Update = max.Update> = Context<U>;

export type IMessageContext = IContext<
  max.MessageCreatedUpdate | max.MessageEditedUpdate
>;

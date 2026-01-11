import * as max from 'max-io/lib/types';
import { Context } from 'max-io';

export type IContext<U extends max.Update = max.Update> = Context<U>;

export type IMessageContext = IContext<
  max.MessageCreatedUpdate | max.MessageEditedUpdate
>;

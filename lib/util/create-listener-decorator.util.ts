import { Composer } from '@maxhub/max-bot-api';
import type {
  ComposerMethodArgs,
  ListenerMetadata,
  OnlyFunctionPropertyNames,
} from '../interfaces';
import { createAppendDecorator } from '.';

export const MMAX_LISTENERS_METADATA = 'MMAX_LISTENERS_METADATA';

export const ListenerDecorator =
  <
    TComposer extends Composer<never>,
    TMethod extends OnlyFunctionPropertyNames<TComposer> =
      OnlyFunctionPropertyNames<TComposer>,
  >(
    method: TMethod,
  ) =>
  (...args: ComposerMethodArgs<TComposer, TMethod>) =>
    createAppendDecorator<ListenerMetadata<TComposer>>({
      key: MMAX_LISTENERS_METADATA,
    })({ method, args });

ListenerDecorator.KEY = MMAX_LISTENERS_METADATA;

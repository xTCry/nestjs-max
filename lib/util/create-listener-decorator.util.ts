import { Composer } from 'max-io';

import type {
  ComposerMethodArgs,
  ListenerMetadata,
  OnlyFunctionPropertyNames,
} from '../interfaces';
import { createAppendDecorator } from '.';

export const MMAX_LISTENERS_METADATA = 'MMAX_LISTENERS_METADATA';

export type ListenerDecoratorFactory = <
  TComposer extends Composer<never>,
  TMethod extends OnlyFunctionPropertyNames<TComposer> =
    OnlyFunctionPropertyNames<TComposer>,
>(
  method: TMethod,
) => (...args: ComposerMethodArgs<TComposer, TMethod>) => MethodDecorator;

export const ListenerDecorator: ListenerDecoratorFactory & { KEY: string } = (<
    TComposer extends Composer<never>,
    TMethod extends OnlyFunctionPropertyNames<TComposer> =
      OnlyFunctionPropertyNames<TComposer>,
  >(
    method: TMethod,
  ) =>
  (...args: ComposerMethodArgs<TComposer, TMethod>) =>
    createAppendDecorator<ListenerMetadata<TComposer>>({
      key: MMAX_LISTENERS_METADATA,
    })({ method, args })) as unknown as ListenerDecoratorFactory & {
  KEY: string;
};

ListenerDecorator.KEY = MMAX_LISTENERS_METADATA;

import { Composer, Middleware } from '@maxhub/max-bot-api';

export type ListenerMeta<
  TComposer extends Composer<never>,
  TMethod extends OnlyFunctionPropertyNames<TComposer> =
    OnlyFunctionPropertyNames<TComposer>,
> = TMethod;

export type Filter<T extends any[], F> = T extends []
  ? []
  : T extends [infer Head, ...infer Tail]
    ? Head extends F
      ? Filter<Tail, F>
      : [Head, ...Filter<Tail, F>]
    : [];

export type OnlyFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type ParametersOrNever<T> = T extends (...args: any[]) => any
  ? Parameters<T>
  : never;

export type NonEmptyArr<T> = [T, ...T[]];

export type _ComposerMethodArgs<
  T extends Composer<never>,
  U extends OnlyFunctionPropertyNames<T> = OnlyFunctionPropertyNames<T>,
> = Filter<ParametersOrNever<T[U]>, Middleware<never>>;

type MethodsAllowingEmpty = 'use' | 'middleware';

export type ComposerMethodArgs<
  T extends Composer<never>,
  U extends OnlyFunctionPropertyNames<T>,
> = U extends MethodsAllowingEmpty
  ? BaseComposerMethodArgs<T, U>
  : NonEmptyArr<BaseComposerMethodArgs<T, U>[number]>;

type BaseComposerMethodArgs<
  T extends Composer<never>,
  U extends OnlyFunctionPropertyNames<T>,
> = Filter<
  Parameters<T[U] extends (...args: any[]) => any ? T[U] : never>,
  Middleware<never>
>;

export interface ListenerMetadata<
  TComposer extends Composer<never> = Composer<never>,
  TMethod extends OnlyFunctionPropertyNames<TComposer> =
    OnlyFunctionPropertyNames<TComposer>,
> {
  method: TMethod;
  args: ComposerMethodArgs<TComposer, TMethod>;
}

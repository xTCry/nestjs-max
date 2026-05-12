import type { ConfigurableModuleAsyncOptions } from '@nestjs/common';
import type { Bot, Context, Middleware } from 'max-io';
import type { UpdateType } from 'max-io/lib/core/network/api';

export type MaxBotConfig<Ctx extends Context> = NonNullable<
  ConstructorParameters<typeof Bot<Ctx>>[1]
>;

export type MaxBotLaunchOptions = {
  allowedUpdates: UpdateType[];
};

export type IMaxReplyOptions = {
  replyTo?: boolean;
  markup?: 'html' | 'markdown';
};

export type MaxModuleOptions<Ctx extends Context = Context> = {
  token: string;
  config?: MaxBotConfig<Ctx>;

  /**
   * Bot name for provider
   */
  botName?: string;

  middlewaresBefore?: ReadonlyArray<Middleware<Context>>;
  middlewaresAfter?: ReadonlyArray<Middleware<Context>>;

  useDebugInfo?: boolean;

  /**
   * Catch bot errors
   * If `false`, the bot will not catch errors.
   */
  useCatchLogger?:
    | ((message: any, stack?: string, context?: string) => void)
    | false;

  replyOptions?: IMaxReplyOptions;

  /**
   * Launch options
   *
   * If `false`, the bot will not be launched.
   *
   * @see {@link https://github.com/max-messenger/max-bot-api-client-ts/blob/d8523b9251a409719406a88ba2179afe16879260/src/bot.ts#L20}
   */
  launchOptions?: Partial<MaxBotLaunchOptions> | false;

  /**
   * List of modules to include (whitelist) into the discovery process.
   */
  include?: Function[];
};

export interface MaxOptionsFactory {
  createMaxOptions(): Promise<MaxModuleOptions> | MaxModuleOptions;
}

export interface MaxModuleAsyncOptions extends ConfigurableModuleAsyncOptions<
  MaxModuleOptions,
  keyof MaxOptionsFactory
> {
  botName?: string;
}

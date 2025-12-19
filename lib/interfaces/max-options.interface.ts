import type { ConfigurableModuleAsyncOptions } from '@nestjs/common';
import type { Context, Middleware } from '@maxhub/max-bot-api';
import type { UpdateType } from '@maxhub/max-bot-api/dist/core/network/api';

export namespace MaxBotApi {
  export type BotConfig<Ctx extends Context> = {
    // clientOptions?: ClientOptions | { baseUrl?: string }; // `baseUrl` readonly
    contextType: new (...args: ConstructorParameters<typeof Context>) => Ctx;
  };

  export type LaunchOptions = {
    allowedUpdates: UpdateType[];
  };
}

export type IMaxReplyOptions = {
  replyTo?: boolean;
  markup?: 'html' | 'markdown';
};

export type MaxModuleOptions<Ctx extends Context = Context> = {
  token: string;
  config?: Partial<MaxBotApi.BotConfig<Ctx>>;

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
  launchOptions?: Partial<MaxBotApi.LaunchOptions> | false;

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

import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Optional,
  Provider,
  Type,
} from '@nestjs/common';
import { DiscoveryModule, ModuleRef } from '@nestjs/core';
import type { Bot } from '@maxhub/max-bot-api';

import { MMAX_BOT_NAME, MMAX_MODULE_OPTIONS } from './max.constants';
import {
  MaxModuleOptions,
  MaxModuleAsyncOptions,
  MaxOptionsFactory,
} from './interfaces';
import { createBotFactory, getBotToken } from './util';
import { MaxExplorerService } from './max-explorer.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [MaxExplorerService],
})
export class MaxCoreModule implements OnApplicationShutdown {
  constructor(
    private readonly moduleRef: ModuleRef,
    @Optional()
    @Inject(MMAX_BOT_NAME)
    private readonly botName: string,
  ) {}

  static forRoot(options: MaxModuleOptions): DynamicModule {
    const botName = getBotToken(options.botName);

    const botNameProvider = {
      provide: MMAX_BOT_NAME,
      useValue: botName,
    };

    const botProvider: Provider = {
      provide: botName,
      useFactory: async () => await createBotFactory(options),
    };

    const providers = [botNameProvider, botProvider];

    return {
      module: MaxCoreModule,
      providers: [
        {
          provide: MMAX_MODULE_OPTIONS,
          useValue: options,
        },
        ...providers,
      ],
      exports: [...providers],
    };
  }

  static forRootAsync(options: MaxModuleAsyncOptions): DynamicModule {
    const botName = getBotToken(options.botName);

    const botNameProvider = {
      provide: MMAX_BOT_NAME,
      useValue: botName,
    };

    const botProvider: Provider = {
      provide: botName,
      useFactory: async (options: MaxModuleOptions) =>
        await createBotFactory(options),
      inject: [MMAX_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);
    const providers = [botNameProvider, botProvider];

    return {
      module: MaxCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, ...providers],
      exports: [...providers],
    };
  }

  /**
   * Returns the asynchrnous providers depending on the given module options
   * @param options Options for the asynchrnous Max module
   */
  private static createAsyncProviders(
    options: MaxModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<MaxOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  /**
   * Returns the asynchrnous Max options providers depending on the given module options
   * @param options Options for the asynchrnous Max module
   */
  private static createAsyncOptionsProvider(
    options: MaxModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MMAX_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useExisting || options.useClass) as Type<MaxOptionsFactory>,
    ];
    return {
      provide: MMAX_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MaxOptionsFactory) =>
        await optionsFactory.createMaxOptions(),
      inject,
    };
  }

  async onApplicationShutdown(signal: string) {
    console.log(`⚠️ Graceful shutdown bot... [${signal}]`);
    const bot = this.moduleRef.get<Bot>(this.botName);
    bot && bot.stop();
  }
}

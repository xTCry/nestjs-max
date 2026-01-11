import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import {
  ExternalContextCreator,
  MetadataScanner,
  ModuleRef,
  ModulesContainer,
  Reflector,
} from '@nestjs/core';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { Bot, Composer, Context, MiddlewareFn, MiddlewareObj } from 'max-io';

import { MaxContextType } from './context';
import { MaxParamsFactory } from './context/max-params.factory';
import { MaxMiddleware, MaxReplyOptions, MaxUpdate } from './decorators';
import {
  IMaxReplyOptions,
  ListenerMetadata,
  MaxModuleOptions,
} from './interfaces';
import { MMAX_BOT_NAME, MMAX_MODULE_OPTIONS } from './max.constants';
import { ListenerDecorator, MiddlewareDebugger } from './util';
import { applyListenerResult } from './util/apply-listener-result.util';

type MwFn = MiddlewareFn<Context> & { displayName: string };

/**
 * Represents a explorer service.
 * This service is used to explore the application and retrieve the discovery items.
 */
@Injectable()
export class MaxExplorerService implements OnModuleInit {
  private readonly logger = new Logger(MaxExplorerService.name);
  private readonly maxParamsFactory = new MaxParamsFactory();
  private bot!: Bot;

  public constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    private readonly metadataScanner: MetadataScanner,
    private readonly modulesContainer: ModulesContainer,
    private readonly externalContextCreator: ExternalContextCreator,

    @Inject(MMAX_MODULE_OPTIONS)
    private readonly maxOptions: MaxModuleOptions,
    @Inject(MMAX_BOT_NAME)
    private readonly botName: string,
  ) {}

  onModuleInit() {
    this.bot = this.moduleRef.get<Bot>(this.botName, { strict: false });
    if (this.maxOptions.useDebugInfo) {
      MiddlewareDebugger.enable(this.bot);
    }
    this.bot.use(...(this.maxOptions.middlewaresBefore ?? []));
    this.explore();
    this.bot.use(...(this.maxOptions.middlewaresAfter ?? []));
  }

  explore() {
    const modules = this.getModules(
      this.modulesContainer,
      this.maxOptions.include || [],
    );

    this.registerMiddleware(modules);
    this.registerUpdates(modules);
  }

  getModules(
    modulesContainer: Map<string, Module>,
    include: Function[],
  ): Module[] {
    if (!include || include.length === 0) {
      return [...modulesContainer.values()];
    }
    const whitelisted = this.includeWhitelisted(modulesContainer, include);
    return whitelisted;
  }

  includeWhitelisted(
    modulesContainer: Map<string, Module>,
    include: Function[],
  ): Module[] {
    const modules = [...modulesContainer.values()];
    return modules.filter(({ metatype }) => include.includes(metatype));
  }

  private registerMiddleware(modules: Module[]): void {
    const middlewares = this.flatMap(modules, (wrapper) =>
      this.filterByReflectDecorator(wrapper, MaxMiddleware),
    );
    for (const wrapper of middlewares) {
      this.registerMiddlewares(this.bot, wrapper);
    }
  }

  private registerUpdates(modules: Module[]): void {
    const updates = this.flatMap(modules, (wrapper) =>
      this.filterByReflectDecorator(wrapper, MaxUpdate),
    );
    for (const wrapper of updates) {
      this.registerListeners(this.bot, wrapper);
    }
  }

  flatMap<T>(
    modules: Module[],
    callback: (wrapper: InstanceWrapper, moduleRef: Module) => T | T[],
  ) {
    return modules
      .map((moduleRef) =>
        [...moduleRef.providers.values()].map((wrapper) =>
          callback(wrapper, moduleRef),
        ),
      )
      .flat(Infinity)
      .filter(Boolean) as NonNullable<T>[];
  }

  private filterByReflectDecorator<MT extends Function & { KEY: string }>(
    wrapper: InstanceWrapper,
    metadataKey: MT,
  ): InstanceWrapper<unknown> | undefined {
    const { instance } = wrapper;
    if (!instance || !wrapper.metatype) return undefined;

    const isSet = this.reflector.get<MT>(metadataKey, wrapper.metatype);
    if (!isSet) return undefined;

    return wrapper;
  }

  private registerMiddlewares(
    composer: Composer<any>,
    wrapper: InstanceWrapper<any>,
  ) {
    const { instance } = wrapper;
    const prototype = Object.getPrototypeOf(instance);
    const methodName = 'middleware';
    if (!(methodName in prototype)) {
      this.logger.warn(
        `Registering middleware on ${methodName} but it does not exist on ${instance.constructor.name}`,
      );
      return;
    }

    this.registerIfMiddleware(composer, instance);
  }

  private registerIfMiddleware(
    composer: Composer<any>,
    instance: MiddlewareObj<any>,
  ): void {
    const methodName = 'middleware';
    const listenerCallbackFn = this.createContextCallback(instance, methodName);
    if (!listenerCallbackFn) {
      return;
    }

    if (this.maxOptions.useDebugInfo) {
      console.log('[Composer] register MW:', {
        class: instance.constructor.name,
      });
    }
    const mwFn: MwFn = async (ctx, next) => {
      // Get middleware
      const fn = await listenerCallbackFn(ctx, next);
      return await fn?.(ctx, next);
    };
    mwFn.displayName = instance.constructor?.name || methodName;
    composer.use(mwFn);
  }

  private registerListeners(
    composer: Composer<any>,
    wrapper: InstanceWrapper<any>,
  ) {
    const { instance } = wrapper;
    const prototype = Object.getPrototypeOf(instance);

    const methodNames = this.metadataScanner.getAllMethodNames(prototype);
    for (const methodName of methodNames) {
      this.registerIfListener(composer, instance, prototype, methodName);
    }
  }

  private getListenerMetadata(
    methodRef: any,
    defaultMetadata?: ListenerMetadata[],
  ): ListenerMetadata<Composer<any>>[] | undefined {
    return this.reflector.get(ListenerDecorator, methodRef) || defaultMetadata;
  }

  private getMergedReplyOptions(
    instance: any,
    methodRef: any,
  ): IMaxReplyOptions {
    const replyOptionsAll = this.reflector.getAllAndMerge<IMaxReplyOptions>(
      MaxReplyOptions,
      [instance.constructor, methodRef],
    );
    return { ...this.maxOptions.replyOptions, ...replyOptionsAll };
  }

  private registerIfListener(
    composer: Composer<any>,
    instance: any,
    prototype: any,
    methodName: string,
    defaultMetadata?: ListenerMetadata[],
  ): void {
    const methodRef = prototype[methodName];
    const metadata = this.getListenerMetadata(methodRef, defaultMetadata);
    const replyOptions = this.getMergedReplyOptions(instance, methodRef);
    if (!metadata || metadata.length === 0) {
      return;
    }

    const listenerCallbackFn = this.createContextCallback(
      instance,
      methodName,
    ) as MwFn | undefined;
    if (!listenerCallbackFn) {
      return;
    }

    for (const { method, args } of metadata) {
      if (this.maxOptions.useDebugInfo) {
        console.log('[Composer] register:', {
          class: instance.constructor.name,
          method,
          args,
        });
      }

      const fn: MwFn = async (ctx, next) => {
        const result = await listenerCallbackFn(ctx, next);
        await applyListenerResult(ctx, result as any, replyOptions);
      };
      fn.displayName = methodName;
      composer[method as 'use'](...(args as any[]), fn);
    }
  }

  private createContextCallback(instance: any, methodName: string) {
    if (!instance || typeof instance[methodName] !== 'function') {
      return;
    }

    const prototype = Object.getPrototypeOf(instance);
    if (!prototype || !prototype[methodName]) {
      return;
    }

    return this.externalContextCreator.create<
      Record<number, ParamMetadata>,
      MaxContextType
    >(
      instance,
      prototype[methodName],
      methodName,
      ROUTE_ARGS_METADATA,
      this.maxParamsFactory,
      undefined,
      undefined,
      { guards: true, filters: true, interceptors: true },
      'mmax',
    );
  }
}

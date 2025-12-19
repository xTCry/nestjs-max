import type { Composer, Context, MiddlewareFn } from '@maxhub/max-bot-api';

type BotInstance = Composer<any> | { use: (...mw: MiddlewareFn<any>[]) => any };

export class MiddlewareDebugger {
  private static originalUses = new Map<string, Function>();
  private static depths = new Map<string, WeakMap<object, number>>();
  public static useColor = true;

  private static getDepth(key: string, update: object | undefined): number {
    if (!update) return 0;
    return this.depths.get(key)?.get(update) ?? 0;
  }

  private static depthAction(
    key: string,
    update: object | undefined,
    val: number,
  ): number {
    if (!update) return 0;

    let depths = this.depths.get(key);
    if (!depths) {
      depths = new WeakMap();
      this.depths.set(key, depths);
    }

    const newDepth = Math.max((depths.get(update) ?? 0) + val, 0);
    if (newDepth < 0) {
      return 0;
    }
    depths.set(update, newDepth);
    return newDepth;
  }

  private static getUpdate(ctx: unknown): object | undefined {
    const update = (ctx as any)?.update ?? ctx;
    return typeof update === 'object' && update !== null ? update : undefined;
  }

  static enable<C extends Context>(bot: BotInstance, key: string = 'default') {
    if (this.originalUses.has(key)) {
      return;
    }

    const originalUse = bot.use.bind(bot);
    this.originalUses.set(key, originalUse);

    bot.use = function (this: any, ...middlewares: MiddlewareFn<C>[]) {
      const wrapped = middlewares.map((mw) => MiddlewareDebugger.wrap(mw, key));
      return originalUse.apply(this, wrapped);
    };
  }

  static enabled(key: string = 'default'): boolean {
    return this.originalUses.has(key);
  }

  static disable(key: string = 'default'): void {
    const originalUse = this.originalUses.get(key);
    if (!originalUse) return;

    this.originalUses.delete(key);
    this.depths.delete(key);
  }

  private static wrap<C extends Context>(
    mw: MiddlewareFn<C>,
    key: string,
  ): MiddlewareFn<C> {
    const c = MiddlewareDebugger.useColor
      ? {
          enter: '\x1b[36m',
          exit: '\x1b[32m',
          next: '\x1b[33m',
          error: '\x1b[31m',
          reset: '\x1b[0m',
        }
      : { enter: '', exit: '', next: '', error: '', reset: '' };

    return async (ctx: C, next: () => Promise<any>) => {
      if (!MiddlewareDebugger.enabled(key)) {
        return mw(ctx, next);
      }

      const update = this.getUpdate(ctx);
      const depth = this.getDepth(key, update);
      const indent = String(depth).padEnd(2, ' ') + '  '.repeat(depth);
      const name = (mw as any).displayName || mw.name || 'anonymous';

      console.log(`${indent}${c.enter}→ ENTER: "${name}"${c.reset}`);

      this.depthAction(key, update, +1);

      try {
        const result = await mw(ctx, async () => {
          console.log(`${indent}  ${c.next}↓ CALL next()${c.reset}`);
          await next();
          console.log(`${indent}  ${c.next}↑ RETURN from next()${c.reset}`);
        });

        console.log(`${indent}${c.exit}← EXIT: "${name}"${c.reset}`);
        return result;
      } catch (err) {
        // TOOD?: может дублироваться с предыдущих шагов
        console.log(`${indent}${c.error}✖ ERROR in: "${name}"${c.reset}`, err);
        throw err;
      } finally {
        this.depthAction(key, update, -1);
      }
    };
  }
}

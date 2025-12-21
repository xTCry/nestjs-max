export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const backoffMs = (attempt: number, min = 1000, max = 30000) => {
  const base = Math.min(max, min * 2 ** Math.min(20, attempt));
  const jitter = Math.floor(
    Math.random() * Math.min(1000, Math.max(50, base / 5)),
  );
  return base + jitter;
};

export type BotRunnerOpts = {
  minDelayMs?: number;
  maxDelayMs?: number;
  autoStop?: boolean;
};

/*
 TODO: по хорошему бы пофиксить библиотеку с api:
 • в `bot` функции `start` полсле `await this.polling.loop` сделать `this.pollingIsStarted = false;`
 • в `polling` при ошибке, после `await new Promise` заменить `return;` на `continue;`
*/

export class BotRunner {
  private running = false;
  private stopRequested = false;
  private loopPromise: Promise<void> | null = null;

  constructor(
    private readonly callbacks: {
      startFn: () => Promise<void>;
      onRestartFn?: () => any;
      onError: (err: unknown) => void;
    },
    private readonly opts: BotRunnerOpts = {},
  ) {}

  start() {
    if (this.loopPromise) return this.loopPromise;
    this.stopRequested = false;
    this.loopPromise = this.loop();
    return this.loopPromise;
  }

  async stop() {
    this.stopRequested = true;
    await (this.loopPromise ?? Promise.resolve());
    this.loopPromise = null;
  }

  isRunning() {
    return this.running;
  }

  private async loop() {
    const minDelayMs = this.opts.minDelayMs ?? 1e3;
    const maxDelayMs = this.opts.maxDelayMs ?? 30e3;
    let attempt = 0;

    while (!this.stopRequested) {
      try {
        await this.callbacks.onRestartFn?.();
        this.running = true;
        await this.callbacks.startFn();
        this.running = false;
        if (this.opts.autoStop ?? true) {
          this.stopRequested = true;
        }
        if (this.stopRequested) break;

        const delayMs = backoffMs(attempt++, minDelayMs, maxDelayMs);
        await delay(delayMs);
      } catch (err) {
        this.running = false;
        this.callbacks.onError(err);
        const delayMs = backoffMs(attempt++, minDelayMs, maxDelayMs);
        await delay(delayMs);
      }
    }

    console.log('[BotRunner] finish');
    this.running = false;
  }
}

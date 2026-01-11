import { ArgumentsHost } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Context, NextFn } from 'max-io';

import { MaxContextType } from './max-execution-context';

export class MaxArgumentsHost extends ExecutionContextHost {
  public static create(context: ArgumentsHost): MaxArgumentsHost {
    const type = context.getType();
    const maxContext = new MaxArgumentsHost(context.getArgs());
    maxContext.setType(type);
    return maxContext;
  }

  public getType<TContext extends string = MaxContextType>(): TContext {
    return super.getType();
  }

  public getContext<T = Context>(): T {
    return this.getArgByIndex(0);
  }

  public getNext<T = NextFn>(): T {
    return this.getArgByIndex(1);
  }
}

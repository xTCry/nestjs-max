import { ContextType, ExecutionContext } from '@nestjs/common';
import { MaxArgumentsHost } from './max-arguments-host';

export type MaxContextType = 'mmax' | ContextType;

export class MaxExecutionContext extends MaxArgumentsHost {
  public static create(context: ExecutionContext): MaxExecutionContext {
    const type = context.getType();
    const maxContext = new MaxExecutionContext(
      context.getArgs(),
      context.getClass(),
      context.getHandler(),
    );
    maxContext.setType(type);
    return maxContext;
  }
}

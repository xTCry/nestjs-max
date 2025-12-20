import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MaxExecutionContext } from 'nestjs-max';

export const UpdateType = createParamDecorator(
  (_, ctx: ExecutionContext) =>
    MaxExecutionContext.create(ctx).getContext().updateType,
);

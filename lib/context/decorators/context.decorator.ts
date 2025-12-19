import { MaxParamType } from '../max-paramtype.enum';
import { createMaxParamDecorator } from './params.util';

export const MaxContext: () => ParameterDecorator = createMaxParamDecorator(
  MaxParamType.CONTEXT,
);

/**
 * Alias for {@link MaxContext}
 */
export const Context = MaxContext;
export const Ctx = Context;

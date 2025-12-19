import { MaxParamType } from '../max-paramtype.enum';
import { createMaxParamDecorator } from './params.util';

export const MaxNext: () => ParameterDecorator = createMaxParamDecorator(
  MaxParamType.NEXT,
);

/**
 * Alias for {@link MaxNext}
 */
export const Next = MaxNext;

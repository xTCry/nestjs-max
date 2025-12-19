import { assignMetadata, ParamData, PipeTransform, Type } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { isNil, isObject, isString } from '@nestjs/common/utils/shared.utils';
import { MaxParamType } from '../max-paramtype.enum';

export function createMaxParamDecorator<PD extends ParamData>(
  type: MaxParamType,
) {
  return (data?: PD): ParameterDecorator =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key!) ||
        {};

      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignMetadata(args, type, index, data),
        target.constructor,
        key!,
      );
    };
}

export function createMaxPipesParamDecorator<PD extends ParamData>(
  type: MaxParamType,
) {
  return (
      data?: PD | (Type<PipeTransform> | PipeTransform),
      ...pipes: (Type<PipeTransform> | PipeTransform)[]
    ): ParameterDecorator =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key!) ||
        {};
      const hasParamData =
        isNil(data) ||
        isString(data) ||
        !(isObject(data) && 'transform' in data);
      const paramData = hasParamData ? data : undefined;
      const paramPipes = hasParamData
        ? pipes
        : [data as PipeTransform, ...pipes];

      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignMetadata(args, type, index, paramData, ...paramPipes),
        target.constructor,
        key!,
      );
    };
}

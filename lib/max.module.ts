import { DynamicModule, Module } from '@nestjs/common';

import { MaxModuleAsyncOptions, MaxModuleOptions } from './interfaces';
import { MaxCoreModule } from './max-core.module';

@Module({})
export class MaxModule {
  public static forRoot(options: MaxModuleOptions): DynamicModule {
    return {
      module: MaxModule,
      imports: [MaxCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: MaxModuleAsyncOptions): DynamicModule {
    return {
      module: MaxModule,
      imports: [MaxCoreModule.forRootAsync(options)],
    };
  }
}

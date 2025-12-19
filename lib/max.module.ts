import { Module, DynamicModule } from '@nestjs/common';
import { MaxCoreModule } from './max-core.module';
import { MaxModuleOptions, MaxModuleAsyncOptions } from './interfaces';

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

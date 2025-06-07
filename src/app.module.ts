import { TransactionMiddleware } from '@leodSWLP/nestjs-data-generic';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './infrastructure/config/configuration';
import { UserModule } from './user-mongoose-test/user.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.getOrThrow('datasource.mongo.uri'),
          dbName: configService.getOrThrow('datasource.mongo.database-name'),
        };
      },
    }),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TransactionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

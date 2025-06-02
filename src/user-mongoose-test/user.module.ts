import { Module } from '@nestjs/common';
import { UserRepository } from './data/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './data/models/user.model';
import { UserService } from './business/user.service';
import { UserTransactionalController } from './user-transactional.controller';

@Module({
  providers: [UserRepository, UserService],
  controllers: [UserTransactionalController],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: UserModel.name,
        useFactory: () => UserSchema,
        collection: 'users',
      },
    ]),
  ],
})
export class UserModule {}

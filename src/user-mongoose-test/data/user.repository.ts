import { BaseModelRepository } from '@leodSWLP/nestjs-data-generic';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from './models/user.model';

export class UserRepository extends BaseModelRepository<UserDocument> {
  constructor(
    @InjectModel(UserModel.name)
    protected readonly model: Model<UserDocument>,
    protected configService: ConfigService,
  ) {
    super(model, UserModel as new () => UserDocument);
  }

  async deleteAll(): Promise<number> {
    const result = await this.model.deleteMany({}).exec();
    return result.deletedCount;
  }
}

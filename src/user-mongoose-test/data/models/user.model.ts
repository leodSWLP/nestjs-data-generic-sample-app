import { BaseModel, createBaseSchema } from '@leodSWLP/nestjs-data-generic';
import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class UserModel extends BaseModel {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export type UserDocument = HydratedDocument<UserModel>;

export const UserSchema = createBaseSchema<typeof UserModel>(UserModel);

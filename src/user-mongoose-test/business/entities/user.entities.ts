import { BaseEntity } from '@dev-force/nestjs-data-generic';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity extends BaseEntity {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

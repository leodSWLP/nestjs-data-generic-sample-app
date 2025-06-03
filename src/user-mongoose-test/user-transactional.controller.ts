import { Controller, Get, Logger, Post } from '@nestjs/common';
import { UserService } from './business/user.service';

import { Transactional } from '@leodSWLP/nestjs-data-generic';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './business/entities/user.entities';
import { UserDocument } from './data/models/user.model';

@Controller('mongo-test/transactions/users')
export class UserTransactionalController {
  private userCounter = 0;

  constructor(private readonly userService: UserService) {}

  private parseResponseEntity = (user: UserDocument) => {
    return plainToInstance(UserEntity, JSON.parse(JSON.stringify(user)));
  };

  @Get()
  @ApiOperation({
    summary: 'List all users in the collection',
    description:
      'Retrieves all user records from the MongoDB collection without any filters or pagination. Used to verify the database state after transactional and non-transactional operations.',
  })
  @ApiResponse({
    status: 201,
    description: 'Returns an array of all user documents in the collection.',
    type: [UserEntity],
  })
  async listUsers() {
    return (await this.userService.listUser()).map((item) =>
      this.parseResponseEntity(item),
    );
  }

  @Post('add-and-update-user-without-tx-success')
  @ApiOperation({
    summary: 'Create and update a user non-transactionally',
    description:
      'Creates a user with username "User1", email "test@gmail.com", and password "password". Updates the password to "password1". Since this is non-transactional and no error occurs, the changes are persisted in the database. Returns the updated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created and updated successfully without a transaction.',
    type: UserEntity,
  })
  async addAndUpdateUserWithoutTxSuccess() {
    const user = await this.userService.createUser({
      username: `add-and-update-user-without-tx-success-${++this.userCounter}`,
      email: `test-${this.userCounter}@gmail.com`,
      password: 'password',
    });

    user.password = 'password1';
    await this.userService.updateUser(user);
    return this.parseResponseEntity(user);
  }

  @Post('add-and-update-user-without-tx-error')
  @ApiOperation({
    summary:
      'Create and update a user non-transactionally, then throw an error',
    description:
      'Creates a user with username "User2", email "test2@gmail.com", and password "password". Throws an error before updates the password to "password1". Since this is non-transactional, the created user persists in the database despite the error.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Throws an error after creating and updating the user. The user persists in the database.',
  })
  async addAndUpdateUserWithoutTxError() {
    const user = await this.userService.createUser({
      username: `add-and-update-user-without-tx-error-${++this.userCounter}`,
      email: `test-${this.userCounter}@gmail.com`,
      password: 'password',
    });

    this.userService.throwError();
    user.password = 'password1';
    await this.userService.updateUser(user);
  }

  @Post('add-and-update-user-with-tx')
  @ApiOperation({
    summary: 'Create and update a user transactionally',
    description:
      'Creates a user with username "User3", email "test3@gmail.com", and password "password". Updates the password to "password1". Since this is transactional and no error occurs, the changes are committed to the database. Returns the updated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created and updated successfully within a transaction.',
    type: UserEntity,
  })
  @Transactional()
  async addAndUpdateUserWithTx() {
    const user = await this.userService.createUser({
      username: `add-and-update-user-with-tx-${++this.userCounter}`,
      email: `test-${this.userCounter}@gmail.com`,
      password: 'password',
    });

    user.password = 'password1';
    await this.userService.updateUser(user);
    return this.parseResponseEntity(user);
  }

  @Post('create-and-update-user-join-tx')
  @ApiOperation({
    summary: 'Create and update a user with transactional sub-method',
    description:
      'Creates a user with username "User4", email "test4@gmail.com", and password "password" using createUserTransactional, which is annotated with @Transactional to join the parent transaction. Updates the password to "password1". Since no error occurs, the changes are committed to the database. Returns the updated user.',
  })
  @ApiResponse({
    status: 201,
    description:
      'User created and updated successfully within a transaction, with sub-method joining the transaction.',
    type: UserEntity,
  })
  @Transactional()
  async createAndUpdateUserJoinTx() {
    const user = await this.userService.createUserTransactional({
      username: `create-and-update-user-join-tx-${++this.userCounter}`,
      email: `test-${this.userCounter}@gmail.com`,
      password: 'password',
    });

    user.password = 'password1';
    await this.userService.updateUser(user);
    return this.parseResponseEntity(user);
  }

  @Post('create-and-update-user-join-tx-throw-error')
  @ApiOperation({
    summary:
      'Create and update a user with transactional sub-method, then throw an error',
    description:
      'Creates a user with username "User5", email "test5@gmail.com", and password "password" using createUserTransactional, which joins the parent transaction. Updates the password to "password1" and throws an error. Since this is transactional, all changes (creation and update) are rolled back, and no user is persisted.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Throws an error after creating and updating the user. All changes are rolled back.',
  })
  @Transactional()
  async createAndUpdateUserJoinTxThrowError() {
    const user = await this.userService.createUserTransactional({
      username: `create-and-update-user-join-tx-throw-error'-${++this.userCounter}`,
      email: `test-${this.userCounter}@gmail.com`,
      password: 'password',
    });

    user.password = 'password1';
    await this.userService.updateUser(user);
    this.userService.throwError();
  }

  @Post('reset')
  @ApiOperation({
    summary: 'Reset the MongoDB user collection',
    description:
      'Deletes all users in the collection to reset the database for test setup.',
  })
  @ApiResponse({
    status: 201,
    description: 'All users deleted successfully.',
  })
  async resetMongo() {
    return this.userService.resetMongo();
  }
}

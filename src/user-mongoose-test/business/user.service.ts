import {
  BaseEntityService,
  Transactional,
} from '@leodSWLP/nestjs-data-generic';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, SortOrder } from 'mongoose';
import { UserDocument, UserModel } from '../data/models/user.model';
import { UserRepository } from '../data/user.repository';
import { UserEntity } from './entities/user.entities';

@Injectable()
export class UserService extends BaseEntityService<UserEntity, UserDocument> {
  constructor(protected readonly repository: UserRepository) {
    super(repository, UserEntity, UserModel as new () => UserDocument);
  }

  throwError() {
    throw new Error('Test - Trigger Rollback');
  }

  async getUser(userId: string): Promise<UserEntity | undefined> {
    const document = await this.getEntity({ id: userId });
    return document;
  }

  @Transactional()
  async getUserThrowError(userId: string) {
    this.logger.debug(`getUserThrowError(): userId = ${userId}`);
    const document = await this.getEntity({ id: userId });
    this.logger.debug(
      `getUserThrowError(): document = ${JSON.stringify(document)}`,
    );
    this.throwError();
  }

  async listUser(
    filter?: FilterQuery<UserModel>,
    listOptions?: {
      offset?: number;
      size?: number;
      sort?: { [key: string]: SortOrder };
    },
  ): Promise<UserEntity[]> {
    const entities = await this.list(filter ?? {}, listOptions);
    return entities;
  }

  @Transactional()
  async listUserThrowError(
    filter?: FilterQuery<UserModel>,
    listOptions?: {
      offset?: number;
      size?: number;
      sort?: { [key: string]: SortOrder };
    },
  ) {
    this.logger.debug(
      `listUserThrowError(): filter = ${JSON.stringify(filter)}`,
    );
    const entities = await this.list(filter ?? {}, listOptions);
    this.logger.debug(
      `listUserThrowError(): entities = ${JSON.stringify(entities)}`,
    );
    this.throwError();
  }

  async createUser(userEntity: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    const entity = await this.add(userEntity);
    return entity;
  }

  @Transactional()
  async createUserTransactional(
    userEntity: Omit<UserEntity, 'id'>,
  ): Promise<UserEntity> {
    this.logger.debug(
      `createUserTransactional(): userEntity = ${JSON.stringify(userEntity)}`,
    );
    const entity = await this.add(userEntity);
    this.logger.debug(
      `createUserTransactional(): entity = ${JSON.stringify(entity)}`,
    );
    return entity;
  }

  async createMultipleUsers(
    users: Omit<UserEntity, 'id'>[],
  ): Promise<UserEntity[]> {
    this.logger.debug(
      `createMultipleUsers(): users = ${JSON.stringify(users)}`,
    );
    const entities: UserEntity[] = [];
    for (const user of users) {
      const entity = await this.createUser(user);
      entities.push(entity);
    }
    this.logger.debug(
      `createMultipleUsers(): entities = ${JSON.stringify(entities)}`,
    );
    return entities;
  }

  @Transactional()
  async createMultipleUsersTransactional(
    users: Omit<UserEntity, 'id'>[],
  ): Promise<UserEntity[]> {
    this.logger.debug(
      `createMultipleUsersTransactional(): users = ${JSON.stringify(users)}`,
    );
    const entities: UserEntity[] = [];
    for (const user of users) {
      const entity = await this.createUserTransactional(user);
      entities.push(entity);
    }
    this.logger.debug(
      `createMultipleUsersTransactional(): entities = ${JSON.stringify(entities)}`,
    );
    return entities;
  }

  async updateUser(userEntity: UserEntity): Promise<UserEntity> {
    return await this.update({ id: userEntity.id }, userEntity);
  }

  async deleteUser(userEntity: UserEntity): Promise<void> {
    await this.remove({ id: userEntity.id });
  }

  async resetMongo(): Promise<void> {
    this.logger.debug(`resetMongo(): Enter`);
    await this.repository.deleteAll();
    this.logger.debug(`resetMongo(): All documents deleted`);
  }
}

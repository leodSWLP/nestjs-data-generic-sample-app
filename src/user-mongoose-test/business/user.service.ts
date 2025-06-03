import { Transactional } from '@leodSWLP/nestjs-data-generic';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FilterQuery, SortOrder } from 'mongoose';
import { UserDocument, UserModel } from '../data/models/user.model';
import { UserRepository } from '../data/user.repository';
import { UserEntity } from './entities/user.entities';

@Injectable()
export class UserService {
  constructor(protected readonly repository: UserRepository) {}

  async getUser(userId: string) {
    const document = await this.repository.findById({ id: userId });
    console.log('getUser():', JSON.stringify(document));
    return document;
  }

  async getUserThrowError(userId: string) {
    const document = await this.repository.findById({ id: userId });
    console.log('getUserThrowError():', JSON.stringify(document));
    this.throwError();
    return document;
  }

  async listUser(
    filter?: FilterQuery<UserModel>,
    listOptions?: {
      offset?: number;
      size?: number;
      sort?: {
        [key: string]: SortOrder;
      };
    },
  ) {
    const documents = await this.repository.list(filter ?? {}, listOptions);
    console.log('getUser():', JSON.stringify(documents));
    return documents;
  }

  async listUserThrowError(
    filter?: FilterQuery<UserModel>,
    listOptions?: {
      offset?: number;
      size?: number;
      sort?: {
        [key: string]: SortOrder;
      };
    },
  ) {
    const documents = await this.repository.list(filter ?? {}, listOptions);
    console.log('listUserThrowError():', JSON.stringify(documents));
    this.throwError();
    return documents;
  }

  async createUser(userEntity: Omit<UserEntity, 'id'>) {
    const model = plainToInstance(UserModel, userEntity);
    const document = await this.repository.create(model);
    console.log('createUser():', JSON.stringify(document));
    return document;
  }

  @Transactional()
  async createUserTransactional(userEntity: Omit<UserEntity, 'id'>) {
    const model = plainToInstance(UserModel, userEntity);
    const document = await this.repository.create(model);
    console.log('createUserTransactional():', JSON.stringify(document));
    return document;
  }

  async createMultipleUsers(users: Omit<UserEntity, 'id'>[]) {
    const documents: UserDocument[] = [];
    for (const user of users) {
      const document = await this.createUser(user);
      documents.push(document);
    }
    return documents;
  }

  @Transactional()
  async createMultipleUsersTransactional(users: Omit<UserEntity, 'id'>[]) {
    const documents: UserDocument[] = [];
    for (const user of users) {
      const document = await this.createUserTransactional(user);
      documents.push(document);
    }
    return documents;
  }

  async updateUser(userEntity: UserEntity) {
    const document = await this.repository.updateById(userEntity, userEntity);
    console.log('createUser():', document ? JSON.stringify(document) : '');
    return document;
  }

  async deleteUser(userEntity: UserEntity) {
    const document = await this.repository.deleteById(userEntity);
    console.log('createUser():', JSON.stringify(document));
  }

  async resetMongo() {
    await this.repository.deleteAll();
  }

  throwError() {
    throw new Error('Test - Trigger Rollback');
  }
}

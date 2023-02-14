import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';

import { Pagination, PaginationOptions } from '@/utils/pagination.util';
import { CreateUserDto, UpdateUserDto, User } from './user.entity';
import { UserService } from './user.service';
import { ValidationPipe } from '@/common/pipes/validation.pipe';

@Controller({
  path: 'users',
  version: '1',
})
export class UserControllerV1 {
  constructor(private _userService: UserService) {}

  @Get()
  async list(
    @Query() paginationOptions: PaginationOptions,
  ): Promise<Pagination<User>> {
    return await this._userService.list(paginationOptions);
  }

  @Get(':id')
  async get(@Param('id') userId: number): Promise<User> {
    return await this._userService.get(userId);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() body: CreateUserDto) {
    return await this._userService.create(body);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') userId: number, @Body() body: UpdateUserDto) {
    return await this._userService.update(userId, body);
  }

  @Delete(':id')
  @UsePipes(new ValidationPipe())
  async destroy(@Param('id') userId: number) {
    return await this._userService.destroy(userId);
  }
}

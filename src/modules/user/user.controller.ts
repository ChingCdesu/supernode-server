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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ValidationPipe } from '@/common/pipes/validation.pipe';
import { Pagination, PaginationOptions } from '@/utils/pagination.util';

import { User as UserModel } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserControllerV1 {
  constructor(private readonly _userService: UserService) {}

  @ApiOperation({ summary: '列出用户列表' })
  @Get()
  async list(
    @Query() paginationOptions: PaginationOptions,
  ): Promise<Pagination<UserModel>> {
    return await this._userService.list(paginationOptions);
  }

  @ApiOperation({ summary: '获取特定id的用户' })
  @Get(':id')
  async get(@Param('id') userId: number): Promise<UserModel> {
    return await this._userService.get(userId);
  }

  @ApiOperation({ summary: '添加用户' })
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() body: CreateUserDto) {
    return await this._userService.create(body);
  }

  @ApiOperation({ summary: '更新用户' })
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') userId: number, @Body() body: UpdateUserDto) {
    return await this._userService.update(userId, body);
  }

  @ApiOperation({ summary: '删除用户' })
  @Delete(':id')
  @UsePipes(new ValidationPipe())
  async destroy(@Param('id') userId: number) {
    return await this._userService.destroy(userId);
  }
}

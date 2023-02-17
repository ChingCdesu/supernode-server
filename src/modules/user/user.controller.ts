import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { Pagination, PaginationOptions } from '@/utils/pagination.util';
import { AdministrationGuard } from '@/common/guards/administration.guard';
import { AuthenticatedGuard } from '@/common/guards/authenticated.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as UserModel } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserControllerV1 {
  constructor(private readonly _userService: UserService) {}

  @ApiOperation({ summary: '列出用户列表' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get()
  async list(
    @Query() paginationOptions: PaginationOptions,
  ): Promise<Pagination<UserModel>> {
    return await this._userService.list(paginationOptions);
  }

  @ApiOperation({ summary: '获取特定id的用户' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get(':id')
  async get(@Param('id') userId: number): Promise<UserModel> {
    return await this._userService.get(userId);
  }

  @ApiOperation({ summary: '添加用户' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(@Body() body: CreateUserDto) {
    return await this._userService.create(body);
  }

  @ApiOperation({ summary: '更新用户' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  async update(@Param('id') userId: number, @Body() body: UpdateUserDto) {
    return await this._userService.update(userId, body);
  }

  @ApiOperation({ summary: '删除用户' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Delete(':id')
  async destroy(@Param('id') userId: number) {
    return await this._userService.destroy(userId);
  }

  @ApiOperation({ summary: '获取自己的用户信息' })
  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: '更新自己的用户信息' })
  @UseGuards(AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put('me')
  async updateMe(@Req() req: Request, @Body() body: UpdateUserDto) {
    const userId = req.user.id;
    return await this._userService.update(userId, body);
  }
}

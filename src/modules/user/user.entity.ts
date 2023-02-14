import {
  Equals,
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Table, Column, Model, Default } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  name: string;

  @Default(false)
  @Column
  isAdmin: boolean;

  @Column({
    get: () => undefined,
  })
  password?: string;

  @Default('local')
  @Column
  issuer: string;
}

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是string类型' })
  readonly name: string;
  @IsOptional()
  @IsBoolean({ message: '拥有管理权限必须是boolean类型' })
  readonly isAdmin?: boolean;
  @IsOptional()
  @IsString({ message: '密码必须是string类型' })
  readonly password?: string;
  @IsOptional()
  @Equals('local', { message: '注册类型必须是local' })
  readonly issuer?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: '用户名必须是string类型' })
  readonly name?: string;
  @IsOptional()
  @IsBoolean({ message: '拥有管理权限必须是boolean类型' })
  readonly isAdmin?: boolean;
  @IsOptional()
  @IsString({ message: '密码必须是string类型' })
  readonly password?: string;
  @IsEmpty({ message: '注册类型不可修改' })
  readonly issuer?: string;
}

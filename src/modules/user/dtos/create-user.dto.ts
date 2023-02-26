import {
  Equals,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'username', description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是string类型' })
  readonly name: string;

  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式验证失败' })
  readonly email?: string;

  @ApiProperty({
    example: true,
    description: '用户是否拥有管理权限',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '拥有管理权限必须是boolean类型' })
  readonly isAdmin?: boolean;

  @ApiProperty({
    example: 'secret@password',
    description: '密码',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '密码必须是string类型' })
  readonly password?: string;

  @ApiProperty({
    example: 'local',
    description: '注册类型必须为local',
    default: 'local',
    required: false,
  })
  @IsOptional()
  @Equals('local', { message: '注册类型必须是local' })
  readonly issuer?: string;
}

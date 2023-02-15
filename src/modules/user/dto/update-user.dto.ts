import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEmpty,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'username', description: '用户名', required: false })
  @IsOptional()
  @IsString({ message: '用户名必须是string类型' })
  readonly name?: string;

  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式验证失败' })
  readonly email?: string;

  @ApiProperty({
    example: true,
    description: '用户是否拥有管理权限',
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

  @IsEmpty({ message: '注册类型不可修改' })
  readonly issuer?: string;
}

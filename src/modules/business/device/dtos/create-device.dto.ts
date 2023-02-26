import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessCreateDeviceDto {
  @ApiProperty({ description: '设备名称', required: true })
  @IsNotEmpty({ message: '设备名称不能为空' })
  @IsString({ message: '设备名称必须为字符串' })
  readonly name: string;

  @ApiProperty({ description: '设备公钥', required: false })
  @IsOptional()
  @IsString({ message: '设备公钥必须为字符串' })
  readonly publicKey?: string;

  @ApiProperty({ description: '目标社群的id', required: true })
  @IsNotEmpty({ message: '社群id不能为空' })
  @IsNumber({}, { message: '社群id必须为数字' })
  readonly communityId: number;
}

import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessUpdateDeviceDto {
  @ApiProperty({ description: '设备名称', required: false })
  @IsOptional()
  @IsString({ message: '设备名称必须为字符串' })
  readonly name?: string;

  @ApiProperty({ description: '设备公钥', required: false })
  @IsOptional()
  @IsString({ message: '设备公钥必须为字符串' })
  readonly publicKey?: string;

  @ApiProperty({ description: '转移到其他社群，目标社群的id', required: false })
  @IsOptional()
  @IsNumber({}, { message: '社群id必须为数字' })
  readonly communityId?: number;
}

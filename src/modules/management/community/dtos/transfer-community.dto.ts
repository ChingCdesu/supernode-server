import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDeviceDto } from '../../device/dtos/create-device.dto';

// 导入导出使用
export class TransferCommunityDto {
  @ApiProperty({ description: '社群名称', required: true })
  @IsNotEmpty({ message: '社群名称不能为空' })
  @IsString({ message: '社群名称必须为字符串' })
  name: string;

  @ApiProperty({ description: '子网地址', required: false })
  @IsOptional()
  @Matches(/^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/, {
    message: '子网地址必须为 CIDR 格式',
  })
  subnet?: string;

  @ApiProperty({ description: '是否启用加密', required: false })
  @IsOptional()
  @IsBoolean({ message: '是否启用加密必须为布尔值' })
  encryption?: boolean;

  @ApiProperty({ description: '设备列表', required: false })
  @IsOptional()
  @IsArray({ message: '设备列表必须为数组' })
  devices?: CreateDeviceDto[];
}

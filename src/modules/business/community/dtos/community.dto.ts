import type { DeviceDto } from '@/modules/management/device/dtos/device.dto';
// import type { Device } from "@/modules/supernode/entities/device.entity";

export class CommunityDto {
  id: number;
  name: string;
  subnet: string;
  encryption: boolean;
  devices?: DeviceDto[];
  totalUserCount: number;
  onlineUserCount: number;
  createdAt: Date;
  updatedAt: Date;
}

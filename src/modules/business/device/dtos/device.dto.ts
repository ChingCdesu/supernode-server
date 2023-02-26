import { Community } from '@/modules/supernode/entities/community.entity';
import { User } from '@/modules/user/entities/user.entity';

export class DeviceDto {
  id: number;
  name: string;
  publicKey: string;
  community: Community;
  owner: User;
  createdAt: Date;
  updatedAt: Date;
  isOnline: boolean;
  mac?: string;
  ip?: string;
  protocol?: 'TCP' | 'UDP';
  lastSeen?: number;
}

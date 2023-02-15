import { User } from '@/modules/user/entities/user.entity';

export class AuthResponseDto extends User {
  access_token: string;
}

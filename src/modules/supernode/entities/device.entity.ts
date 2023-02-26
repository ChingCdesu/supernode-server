import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { User } from '@/modules/user/entities/user.entity';

import { Community } from './community.entity';

@Table
export class Device extends Model {
  @Column
  name: string;

  @Column
  publicKey: string;

  @ForeignKey(() => User)
  @Column
  ownerId: number;

  @BelongsTo(() => User)
  owner: User;

  @ForeignKey(() => Community)
  @Column
  communityId: number;

  @BelongsTo(() => Community)
  community: Community;
}

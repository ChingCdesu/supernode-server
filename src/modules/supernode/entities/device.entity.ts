import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Community } from './community.entity';

@Table
export class Device extends Model {
  @Column
  name: string;

  @Column
  publicKey: string;

  @ForeignKey(() => Community)
  @Column
  communityId: number;

  @BelongsTo(() => Community)
  community: Community;
}

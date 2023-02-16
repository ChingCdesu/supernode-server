import {
  Table,
  Model,
  Column,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';

import { User } from '@/modules/user/entities/user.entity';

@Table
export class AuditLog extends Model {
  @Column
  action: string;

  @Column
  resource: string;

  @Column
  resourceId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  log: string;
}

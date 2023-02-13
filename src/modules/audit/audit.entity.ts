import { Table, Model, Column, BelongsTo, HasOne } from 'sequelize-typescript';

import { User } from '@/modules/user/user.entity';

@Table
export class AuditLog extends Model {
  @HasOne(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  log: string;
}

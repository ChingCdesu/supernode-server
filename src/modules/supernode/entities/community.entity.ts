import { Column, HasMany, Model, Table, Unique } from 'sequelize-typescript';

import { Device } from './device.entity';

@Table
export class Community extends Model {
  @Column
  @Unique
  name: string;

  @Column
  subnet?: string;

  @Column
  encryption?: boolean;

  @HasMany(() => Device)
  devices: Device[];
}

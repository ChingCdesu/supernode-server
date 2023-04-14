import { Column, Default, HasMany, Model, Table, Unique } from 'sequelize-typescript';

import { Device } from './device.entity';

@Table
export class Community extends Model {
  @Unique
  @Column
  name: string;

  @Column
  subnet?: string;

  @Default(false)
  @Column
  encryption?: boolean;

  @HasMany(() => Device)
  devices: Device[];
}

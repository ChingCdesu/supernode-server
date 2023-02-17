import { Column, Default, Model, Table, Unique } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Unique
  @Column
  name: string;

  @Unique
  @Column
  email?: string;

  @Default(false)
  @Column
  isAdmin: boolean;

  @Column({
    get: () => undefined,
  })
  password?: string;

  @Default('local')
  @Column
  issuer: string;

  @Unique
  @Column
  uniqueId?: string;
}

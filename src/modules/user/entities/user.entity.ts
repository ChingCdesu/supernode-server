import { Column, Default, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  name: string;

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

  @Column
  uniqueId?: string;
}

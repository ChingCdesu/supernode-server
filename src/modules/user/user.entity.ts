import { Table, Column, Model, Default } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  name: string;

  @Column
  isAdmin: boolean;

  @Column
  password?: string;

  @Default('local')
  @Column
  issuer: string;
}

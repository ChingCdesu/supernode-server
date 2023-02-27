import * as bcrypt from 'bcrypt';
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

  @Column
  get password(): string | undefined {
    return undefined;
  }

  set password(value: string) {
    this.setDataValue('password', bcrypt.hashSync(value, 12));
  }

  @Default('local')
  @Column
  issuer: string;

  @Unique
  @Column
  uniqueId?: string;
}

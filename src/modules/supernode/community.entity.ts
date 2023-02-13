import {
  Model,
  Table,
  Column,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';

@Table
export class Community extends Model {
  @Column
  name: string;

  @Column
  subnet?: string;

  @Column
  encryption?: boolean;

  @HasMany(() => CommunityUser)
  users: CommunityUser[];
}

@Table
export class CommunityUser extends Model {
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

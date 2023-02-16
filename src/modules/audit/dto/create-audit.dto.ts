export class CreateAuditDto {
  action: string;
  resource: string;
  resourceId: number;
  userId: number;
  log: string;
}

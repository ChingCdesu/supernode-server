import { Logger } from '@nestjs/common';
export class LoggerProvider {
  protected readonly logger: Logger = new Logger(this.constructor.name);
}

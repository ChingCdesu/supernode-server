import { Logger } from '@nestjs/common';

export class LoggerProvider {
  protected logger: Logger = new Logger(this.constructor.name);
}

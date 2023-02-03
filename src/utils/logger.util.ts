import { Logger, LogLevel as NestLogLevel } from '@nestjs/common';

export enum LogLevel {
  error = 1,
  warn,
  log,
  debug,
  verbose,
}

export const LogLevels: NestLogLevel[] = [
  'error',
  'warn',
  'log',
  'debug',
  'verbose',
];

export class LoggerProvider {
  protected readonly logger: Logger = new Logger(this.constructor.name);
}

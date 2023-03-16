import { LogLevel as NestLogLevel } from '@nestjs/common';

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

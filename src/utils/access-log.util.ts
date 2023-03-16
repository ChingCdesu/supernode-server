import * as log4js from 'log4js';

import { LogLevel } from '@/constants/log-level.constant';
import { useConfig } from '@/utils/config.util';

class AccessLogger {
  private logger?: log4js.Logger = null;

  constructor() {
    const config = useConfig();
    if (config.app.accessLogFilePath) {
      log4js.configure({
        appenders: {
          access: {
            type: 'file',
            filename: config.app.accessLogFilePath,
            layout: {
              type: 'pattern',
              pattern: '%d %m%n',
            },
          },
        },
        categories: {
          default: {
            appenders: ['access'],
            level: LogLevel[config.app.logLevel],
          },
        },
      });
      this.logger = log4js.getLogger();
    }
  }

  public log(message: string): void {
    if (!this.logger) {
      return;
    }
    this.logger.log('info', message);
  }
}

const accessLogger = new AccessLogger();

export { accessLogger };

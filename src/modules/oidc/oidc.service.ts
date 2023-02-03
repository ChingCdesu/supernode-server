import { LoggerProvider } from '@/utils/logger.util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OidcService extends LoggerProvider {}

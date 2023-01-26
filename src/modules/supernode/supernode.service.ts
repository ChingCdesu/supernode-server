import { Injectable } from '@nestjs/common';
import { createServer, startServer } from '@/utils/native.util';

@Injectable()
export class SupernodeService {
  constructor() {
    createServer();
    startServer();
  }
}

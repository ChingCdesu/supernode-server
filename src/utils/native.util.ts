// eslint-disable-next-line @typescript-eslint/no-var-requires
const native = require('../../native/build/node-supernode.node');

export interface SupernodeOptions {
  port: number;
  federationName: string;
  federationParent: string;
  disableSpoofingProtection: boolean;
  subnetRange: string;
}

export interface Supernode extends SupernodeOptions {
  startTime: number;
  version: string;
  communityCount: number;
}

export function createServer(options?: Partial<SupernodeOptions>) {
  native.createServer(options);
}

export function startServer(): Promise<Supernode> {
  return native.startServer();
}

export function stopServer() {
  native.stopServer();
}

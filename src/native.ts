// eslint-disable-next-line @typescript-eslint/no-var-requires
const native = require('../native/build/node-supernode.node');

export interface Supernode {
  port: number;
  startTime: number;
  version: string;
  communityCount: number;
}

export function createSn(callback: (sn: Supernode) => void) {
  native.createSn(callback);
}

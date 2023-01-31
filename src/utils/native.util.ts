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

export interface CommunityUser {
  name: string;
  publicKey: string;
}

export interface CommunityOptions {
  name: string;
  subnet?: string;
  users: CommunityUser[];
}

export interface CommunityPeer {
  name: string;
  mac?: string;
  ip?: string;
  protocol: 'TCP' | 'UDP';
  uptime: number;
  lastSeen: number;
  clientVersion: string;
}

export interface Community extends CommunityOptions {
  peers: CommunityPeer[];
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

export function loadCommunities(communities: CommunityOptions[]): Promise<void> {
  return native.loadCommunities(communities);
}

export function getCommunities(): Promise<Community[]> {
  return native.getCommunities();
}

export function getServerInfo(): Promise<Supernode> {
  return native.getServerInfo();
}

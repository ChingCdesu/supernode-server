// eslint-disable-next-line @typescript-eslint/no-var-requires
const native = require('../../native/build/node-supernode.node');

/**
 * n2n官方文档（英文）：https://github.com/ntop/n2n/tree/3.0-stable/doc
 */

/** Supernode服务器的相关配置 */
export interface SupernodeOptions {
  /** Supernode服务器的UDP监听端口 */
  port: number;
  /** Supernode集群名称，尽量不要用默认的集群名称 */
  federationName?: string;
  /** 可选，集群父节点地址和端口，示例：`12.34.56.78:7654` */
  federationParent: string;
  /** 禁用欺骗攻击保护，建议保持默认 */
  disableSpoofingProtection: boolean;
  /** 自定义Supernode的子网范围，示例：`10.128.255.0-10.255.255.0/24` */
  subnetRange: string;
}

/** Supernode服务器的相关信息 */
export interface Supernode extends SupernodeOptions {
  /** 服务器启动时间戳 */
  startTime: number;
  /** 服务器版本 */
  version: string;
  /** 集群的公钥，在客户端CLI中必须指定(`-P`)且和Supernode服务器相同 */
  publicKey?: string;
  /** 激活的社群数量 */
  communityCount: number;
}

/** 社群用户的信息 */
export interface CommunityUser {
  /** 用户名 */
  name: string;
  /** 从用户名和密码生成的公钥，该公钥与用户名和密码绑定 */
  publicKey: string;
}

export interface CommunityOptions {
  /** 社群名称 */
  name: string;
  /** 社群子网，示例：`192.168.31.1/24` */
  subnet?: string;
  /** 是否启用加密通讯，如果启用了加密通讯，客户端必须指定密钥(`-k`)和加密方式(`-An`) */
  encryption?: boolean;
  /**
   * 可访问此社群的用户
   *
   * 如果`users`不为空，只有`users`内的用户可以访问该社群，且客户端需要强制启用加密，`encryption`选项会被忽略并强制开启
   * 必须指定密钥(`-k`)和只能使用特定的加密方式(`-A4 ChaCha20`和`-A5 SPECK`)
   *
   * 如果`users`为空，则任何用户都可以访问该社群
   */
  users: CommunityUser[];
}

/** 连接到社群的远程设备信息 */
export interface CommunityPeer {
  /** 用户名，与CommunityUser的`name`相对应，表示该用户在线 */
  name: string;
  /** 用户的虚拟网卡物理地址 */
  mac?: string;
  /** 用户的虚拟网ip */
  ip?: string;
  /** 与Supernode服务器通过哪种协议连接 */
  protocol: 'TCP' | 'UDP';
  /** 最后握手的时间戳 */
  lastSeen: number;
}

/** 社群状态信息 */
export interface Community extends CommunityOptions {
  peers: CommunityPeer[];
  users: CommunityUser[];
}

/**
 * 创建Supernode服务器
 * @description Supernode服务器是单例的，整个应用有且只有一个Supernode服务器
 * @param options Supernode服务器选项，所有选项都是可选的/具有默认值的
 */
export function createServer(options?: Partial<SupernodeOptions>) {
  native.createServer(options);
}

/**
 * 启动Supernode服务器
 * @returns Supernode的状态信息
 */
export function startServer(): Promise<Supernode> {
  return native.startServer();
}

/**
 * 停止Supernode服务器
 */
export function stopServer() {
  native.stopServer();
}

/**
 * 加载并应用社群设置
 * @param communities 社群设置，从数据源获取
 */
export function loadCommunities(
  communities: CommunityOptions[],
): Promise<void> {
  return native.loadCommunities(communities);
}

/**
 * 获取所有社群的状态
 * @returns 社群状态
 */
export function getCommunities(): Promise<Community[]> {
  return native.getCommunities();
}

/**
 * 获取Supernode服务器状态
 * @returns Supernode服务器状态
 */
export function getServerInfo(): Promise<Supernode> {
  return native.getServerInfo();
}

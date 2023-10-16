import * as crypto from 'crypto';
import * as fs from 'fs';
import { defaultsDeep, parseInt, set, get } from 'lodash';
import type { Dialect } from 'sequelize';
import path from 'path';
import yaml from 'yaml';

import { LogLevel } from '@/constants/log-level.constant';
import { PartialDeep } from '@/utils/type.util';
import { SupernodeOptions } from './native.util';

export interface Config {
  app: AppConfig;
  dataSource: DataSourceConfig;
  oidc: OidcConfig;
  cache: CacheConfig;
  supernode: Partial<SupernodeOptions>;
}

export interface AppConfig {
  logLevel: LogLevel;
  accessLogFilePath?: string;
  adminUsername: string;
  adminPassword: string;
}

export interface OidcConfig {
  enabled: boolean;
  name: string;
  autoDiscoverUrl: string;
  // authorizationUrl: string;
  // tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  redirectUrl: string;
  adminGroup?: string;
}

export interface DataSourceConfig {
  dialect: Dialect;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  schema?: string;
  storage?: string;
}

export interface CacheConfig {
  redisUrl?: string;
}

const randomPassword = Buffer.from(crypto.getRandomValues(new Uint8Array(128)))
  .toString('base64')
  .slice(0, 16);

const defaultConfig: Config = {
  app: {
    logLevel: LogLevel.log,
    adminUsername: 'admin',
    adminPassword: randomPassword,
  },
  oidc: {
    enabled: false,
    name: '',
    autoDiscoverUrl: '',
    // authorizationUrl: '',
    // tokenUrl: '',
    clientId: '',
    clientSecret: '',
    scope: '',
    redirectUrl: '',
    adminGroup: 'admin',
  },
  dataSource: {
    dialect: 'sqlite',
    host: '',
    port: 0,
    username: '',
    password: '',
    database: '',
    storage: 'data.sqlite',
  },
  cache: {},
  supernode: {
    port: 7654,
    federationName: 'Federation',
    disableSpoofingProtection: false,
    subnetRange: '10.128.255.0-10.255.255.0/24',
  },
};

const envConfigMap: Record<string, string> = {
  APP_LOG_LEVEL: 'app.logLevel',
  APP_ACCESS_LOG_FILE_PATH: 'app.accessLogFilePath',
  APP_ADMIN_USERNAME: 'app.adminUsername',
  APP_ADMIN_PASSWORD: 'app.adminPassword',

  OIDC_ENABLED: 'oidc.enabled',
  OIDC_NAME: 'oidc.name',
  OIDC_AUTO_DISCOVER_URL: 'oidc.autoDiscoverUrl',
  // OIDC_AUTHORIZATION_URL: 'oidc.authorizationUrl',
  // OIDC_TOKEN_URL: 'oidc.tokenUrl',
  OIDC_CLIENT_ID: 'oidc.clientId',
  OIDC_CLIENT_SECRET: 'oidc.clientSecret',
  OIDC_SCOPE: 'oidc.scope',
  OIDC_REDIRECT_URL: 'oidc.redirectUrl',
  OIDC_ADMIN_GROUP: 'oidc.adminGroup',

  DATA_SOURCE_DIALECT: 'dataSource.dialect',
  DATA_SOURCE_HOST: 'dataSource.host',
  DATA_SOURCE_PORT: 'dataSource.port',
  DATA_SOURCE_USERNAME: 'dataSource.username',
  DATA_SOURCE_PASSWORD: 'dataSource.password',
  DATA_SOURCE_DATABASE: 'dataSource.database',
  DATA_SOURCE_SCHEMA: 'dataSource.schema',
  DATA_SOURCE_STORAGE: 'dataSource.storage',

  CACHE_REDIS_URL: 'cache.redisUrl',

  SUPERNODE_PORT: 'supernode.port',
  SUPERNODE_FEDERATION_NAME: 'supernode.federationName',
  SUPERNODE_FEDERATION_PARENT: 'supernode.federationParent',
  SUPERNODE_DISABLE_SPOOFING_PROTECTION: 'supernode.disableSpoofingProtection',
  SUPERNODE_SUBNET_RANGE: 'supernode.subnetRange',
};

let computedConfig: Config | undefined = undefined;

function parseConfigFromFile(filepath: string): PartialDeep<Config> {
  const ext = path.extname(filepath);
  const configStr = fs.readFileSync(filepath).toString();
  switch (ext) {
    case '.json': {
      return JSON.parse(configStr);
    }
    case '.yaml':
    case '.yml': {
      return yaml.parse(configStr);
    }
    default:
      break;
  }
  return {};
}

function parseConfigFromEnv(): PartialDeep<Config> {
  const parsed: PartialDeep<Config> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key in envConfigMap) {
      const path = envConfigMap[key];
      const type = typeof get(defaultConfig, path);
      if (type === 'boolean') {
        set(parsed, path, value === 'true');
      } else if (type === 'number') {
        set(parsed, path, parseInt(value));
      } else {
        set(parsed, path, value);
      }
    }
  }
  return parsed;
}

function loadConfig(): Config {
  let fileConfig: PartialDeep<Config> = {};
  const envConfig = parseConfigFromEnv();
  if (fs.existsSync(process.env.CONFIG_FILE)) {
    fileConfig = parseConfigFromFile(process.env.CONFIG_FILE);
  } else if (fs.existsSync('appconfig.yaml')) {
    fileConfig = parseConfigFromFile('appconfig.yaml');
  } else if (fs.existsSync('appconfig.yml')) {
    fileConfig = parseConfigFromFile('appconfig.yml');
  } else if (fs.existsSync('appconfig.json')) {
    fileConfig = parseConfigFromFile('appconfig.json');
  }
  computedConfig = defaultsDeep(envConfig, fileConfig, defaultConfig);
  return computedConfig;
}

export function useConfig(): Config {
  return computedConfig ?? loadConfig();
}

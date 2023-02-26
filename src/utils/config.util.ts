import * as fs from 'fs';
import type { Dialect } from 'sequelize';
import path from 'path';
import { set } from 'lodash';
import yaml from 'yaml';

import { LogLevel } from '@/utils/logger.util';
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

const defaultConfig: Config = {
  app: {
    logLevel: LogLevel.log,
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
    federationName: '*Federation',
    disableSpoofingProtection: false,
    subnetRange: '10.128.255.0-10.255.255.0/24',
  },
};

const envConfigMap: Record<string, string> = {
  APP_LOG_LEVEL: 'app.logLevel',

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
      set(parsed, path, value);
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
  computedConfig = Object.assign(defaultConfig, fileConfig, envConfig);
  return computedConfig;
}

export function useConfig(): Config {
  return computedConfig ?? loadConfig();
}

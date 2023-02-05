import yaml from 'yaml';
import path from 'path';
import * as fs from 'fs';
import { DeepPartial } from '@/utils/type.util';
import { LogLevel } from '@/utils/logger.util';
import type { DatabaseType } from 'typeorm';
import _ from 'lodash';

export interface Config {
  app: AppConfig;
  dataSource: DataSourceConfig;
  oidc: OidcConfig;
}

export interface AppConfig {
  logLevel: LogLevel;
}

export interface OidcConfig {
  enabled: boolean;
  name: string;
  autoDiscoverUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  redirectUrl: string;
}

export interface DataSourceConfig {
  type: DatabaseType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  schema?: string;
}

const defaultConfig: Config = {
  app: {
    logLevel: LogLevel.log,
  },
  oidc: {
    enabled: false,
    name: '',
    autoDiscoverUrl: '',
    clientId: '',
    clientSecret: '',
    scopes: '',
    redirectUrl: '',
  },
  dataSource: {
    type: 'sqlite',
    host: '',
    port: 0,
    username: '',
    password: '',
    database: 'data.db',
  },
};

const envConfigMap: Record<string, string> = {
  APP_LOG_LEVEL: 'app.logLevel',

  OIDC_ENABLED: 'oidc.enabled',
  OIDC_NAME: 'oidc.name',
  OIDC_AUTO_DISCOVER_URL: 'oidc.autoDiscoverUrl',
  OIDC_CLIENT_ID: 'oidc.clientId',
  OIDC_CLIENT_SECRET: 'oidc.clientSecret',
  OIDC_SCOPES: 'oidc.scopes',
  OIDC_REDIRECT_URL: 'oidc.redirectUrl',

  DATA_SOURCE_TYPE: 'dataSource.type',
  DATA_SOURCE_HOST: 'dataSource.host',
  DATA_SOURCE_PORT: 'dataSource.port',
  DATA_SOURCE_USERNAME: 'dataSource.username',
  DATA_SOURCE_PASSWORD: 'dataSource.password',
  DATA_SOURCE_DATABASE: 'dataSource.database',
  DATA_SOURCE_SCHEMA: 'dataSource.schema',
};

let computedConfig: Config | undefined = undefined;

function parseConfigFromFile(filepath: string): DeepPartial<Config> {
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

function parseConfigFromEnv(): DeepPartial<Config> {
  const parsed: DeepPartial<Config> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key in envConfigMap) {
      const path = envConfigMap[key];
      _.set(parsed, path, value);
    }
  }
  return parsed;
}

function loadConfig(): Config {
  let fileConfig: DeepPartial<Config> = {};
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

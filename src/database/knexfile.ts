import type { Knex } from 'knex';
import { config as appConfig } from '../config/env';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: appConfig.database.host,
    port: appConfig.database.port,
    database: appConfig.database.name,
    user: appConfig.database.user,
    password: appConfig.database.password,
  },
  migrations: {
    directory: isProd 
      ? path.join(__dirname, 'migrations')
      : path.join(__dirname, 'migrations'),
    extension: isProd ? 'js' : 'ts',
  },
};

export default knexConfig;
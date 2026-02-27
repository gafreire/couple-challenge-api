import type { Knex } from 'knex';
import { config as appConfig } from '../config/env';

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
    directory: isProd ? './dist/database/migrations' : './migrations',
    extension: isProd ? 'js' : 'ts',
  },
};

export default knexConfig;
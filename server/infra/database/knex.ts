import { Knex, knex } from 'knex';
import log from 'loglevel';

const connection = process.env.DATABASE_URL;

!connection && log.warn('env var DATABASE_URL not set');

const max =
  (process.env.DATABASE_POOL_MAX && parseInt(process.env.DATABASE_POOL_MAX)) ||
  10;
log.warn('knex pool max:', max);

const knexConfig: Knex.Config = {
  client: 'pg',
  // debug: process.env.NODE_LOG_LEVEL === 'debug',
  debug: true,
  connection,
  pool: { min: 0, max },
};

log.debug(process.env.DATABASE_SCHEMA);
if (process.env.DATABASE_SCHEMA) {
  log.info('setting a schema');
  knexConfig.searchPath = [process.env.DATABASE_SCHEMA, 'public'];
}
log.debug(knexConfig.searchPath);

export default knex(knexConfig);

import { Knex, knex } from 'knex';
import log from 'loglevel';

const connection = process.env.DATABASE_URL;

!connection && log.warn('env var DATABASE_URL not set');

const knexConfig: Knex.Config = {
  client: 'pg',
  // debug: process.env.NODE_LOG_LEVEL === 'debug',
  debug: true,
  connection,
  pool: { min: 0, max: 10 },
};

log.debug(process.env.DATABASE_SCHEMA);
if (process.env.DATABASE_SCHEMA) {
  log.info('setting a schema');
  knexConfig.searchPath = [process.env.DATABASE_SCHEMA, 'public'];
}
log.debug(knexConfig.searchPath);

export default knex(knexConfig);

export const enum TableNames {
  Trees = 'trees',
  Wallets = 'wallet',
  Species = 'tree_species',
  Planters = 'planter',
  Organizations = 'entity',
  Countries = 'region',
  RegionType = 'region_type',
}

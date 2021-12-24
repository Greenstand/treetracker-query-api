import { Knex, knex } from 'knex'
import log from 'loglevel'

const connection = process.env.DATABASE_URL

const knexConfig: Knex.Config = {
  client: 'pg',
  debug: process.env.NODE_LOG_LEVEL === 'debug',
  connection,
  pool: { min: 0, max: 10 },
}

log.debug(process.env.DATABASE_SCHEMA)
if (process.env.DATABASE_SCHEMA) {
  log.info('setting a schema')
  knexConfig.searchPath = [process.env.DATABASE_SCHEMA, 'public']
}
log.debug(knexConfig.searchPath)

export default knex(knexConfig)

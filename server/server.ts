import * as dotenv from 'dotenv';
import log from 'loglevel';
import app from 'app';
import knex from 'infra/database/knex';

dotenv.config();
// setup log level
require('./setup');

const port = process.env.NODE_PORT || 3006;

const server = app.listen(port, () => {
  log.warn(`listening on port:${port}`);
  log.debug('debug log level!');
});

process.once('SIGINT', (code) => {
  console.log('Terminate request received...');
  knex.destroy();
  server.close();
});

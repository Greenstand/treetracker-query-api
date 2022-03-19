import { knex } from 'knex';
import log from 'loglevel';
const uuid = require('uuid');

const connection = process.env.DATABASE_URL;

!connection && log.warn('env var DATABASE_URL not set');

const knexConfig = {
  client: 'pg',
  // debug: process.env.NODE_LOG_LEVEL === 'debug',
  debug: true,
  connection,
  pool: { min: 0, max: 10 },
};

const dataRawCaptureFeature = [
  {
    id: uuid.v4(),
    lat: '41.50414585511928',
    lon: '-75.66275380279951',
    location: '0101000020E6100000B514ED8E6AEA52C05D13F4D987C04440',
    field_user_id: 5127,
    field_username: 'test',
    created_at: new Date().toUTCString(),
    updated_at: new Date().toUTCString(),
  },
  {
    id: uuid.v4(),
    lat: '57.57641356164619',
    lon: '-113.11416324692146',
    location: '0101000020E6100000B4FB5C734E475CC0E21E6AEBC7C94C40',
    field_user_id: 5127,
    field_username: 'test',
    created_at: new Date().toUTCString(),
    updated_at: new Date().toUTCString(),
  },
];

async function seed() {
  knexConfig.searchPath = [process.env.DATABASE_SCHEMA, 'webmap'];
  const serverCon = knex(knexConfig);
  const response = await serverCon.transaction(async (trx) => {
    return await trx.insert(dataRawCaptureFeature).into('raw_capture_feature');
  });
  serverCon.destroy();
  return response;
}

async function clear() {
  knexConfig.searchPath = [process.env.DATABASE_SCHEMA, 'webmap'];
  const serverCon = knex(knexConfig);
  const response = await serverCon('raw_capture_feature').del();
  serverCon.destroy();
  return response;
}

export default { clear, seed };

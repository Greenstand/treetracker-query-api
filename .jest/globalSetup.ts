import * as dotenv from 'dotenv';
dotenv.config();
import exampleTree from '../docs/api/spec/examples/trees/912681.json';
// import exampleWallet from '@mocks/wallets/exampleWallet.json';
import knex, { TableNames } from '../server/infra/database/knex';

export default async function globalSetup() {
  if (process.env.SEED === 'true') {
    await knex(TableNames.Trees).insert(exampleTree);
  }
  knex.destroy();
}

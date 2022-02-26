import * as dotenv from 'dotenv';
dotenv.config();
import exampleTree from '../docs/api/spec/examples/trees/912681.json';
import exampleWallet from '../docs/api/spec/examples/wallets/exampleWallet.json';
import knex, { TableNames } from '../server/infra/database/knex';

export default async function globalSetup() {
  if (process.env.SEED === 'true') {
    await knex(TableNames.Trees).insert(exampleTree);
    // seed wallet data
    await knex.raw(
      `insert into wallet.wallet ("created_at", "id", "logo_url", "name", "password", "salt") values (?, ?, ?, ?, ?, ?)`,
      [
        exampleWallet.created_at,
        exampleWallet.id,
        exampleWallet.logo_url,
        exampleWallet.name,
        exampleWallet.password,
        exampleWallet.salt,
      ],
    );
  }
  knex.destroy();
}

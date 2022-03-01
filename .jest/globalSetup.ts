import * as dotenv from 'dotenv';
dotenv.config();
import exampleTree from '../docs/api/spec/examples/trees/exampleTree.json';
import exampleWallet from '../docs/api/spec/examples/wallets/exampleWallet.json';
import exampleSpecies from '../docs/api/spec/examples/species/exampleSpecies.json';
import examplePlanter from '../docs/api/spec/examples/planters/examplePlanter.json';
import exampleCountry from '../docs/api/spec/examples/countries/exampleCountry.json';
import exampleOrganization from '../docs/api/spec/examples/organizations/exampleOrganization.json';
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

    await knex(TableNames.Species).insert(exampleSpecies);
    await knex(TableNames.Organizations).insert(exampleOrganization);
    await knex(TableNames.Planters).insert(examplePlanter);
    await knex(TableNames.Countries).insert(exampleCountry);
  }
  knex.destroy();
}

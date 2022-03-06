import * as dotenv from 'dotenv';
dotenv.config();
import 'tsconfig-paths/register';
import tree from '@seeds/data/tree.json';
import wallet from '@seeds/data/wallet.json';
import species from '@seeds/data/species.json';
import planter from '@seeds/data/planter.json';
import country from '@seeds/data/country.json';
import organization from '@seeds/data/organization.json';
import token from '@seeds/data/token.json';
import knex, { TableNames } from 'infra/database/knex';

export default async function globalSetup() {
  if (process.env.SEED === 'true') {
    await knex(TableNames.Trees).insert(tree);
    await knex('wallet').withSchema('wallet').insert(wallet);
    await knex('token').withSchema('wallet').insert(token);
    await knex(TableNames.Species).insert(species);
    await knex(TableNames.Organizations).insert(organization);
    await knex(TableNames.Planters).insert(planter);
    await knex('region_type').insert({
      id: 6,
      type: 'country',
    });
    await knex(TableNames.Countries).insert(country);
  }
  knex.destroy();
}

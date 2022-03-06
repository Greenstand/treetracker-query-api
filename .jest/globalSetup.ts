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
import regionType from '@seeds/data/region_type.json';
import knex, {
  PublicTables,
  SchemaNames,
  WalletTables,
} from 'infra/database/knex';

export default async function globalSetup() {
  if (process.env.SEED === 'true') {
    await knex(PublicTables.Trees).insert(tree);
    await knex(WalletTables.Wallet)
      .withSchema(SchemaNames.Wallet)
      .insert(wallet);
    await knex(WalletTables.Token).withSchema(SchemaNames.Wallet).insert(token);
    await knex(PublicTables.Species).insert(species);
    await knex(PublicTables.Organizations).insert(organization);
    await knex(PublicTables.Planters).insert(planter);
    await knex(PublicTables.RegionType).insert(regionType);
    await knex(PublicTables.Countries).insert(country);
  }
  knex.destroy();
}

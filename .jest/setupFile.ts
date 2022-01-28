import knex from 'infra/database/knex';

afterAll(async () => {
  await knex.destroy();
});

import { Client } from 'pg';

describe('knex config', () => {
  const originalEnv = process.env;
  const instances: { destroy: () => Promise<void> }[] = [];

  afterEach(async () => {
    process.env = originalEnv;
    await Promise.all(instances.splice(0).map((knex) => knex.destroy()));
  });

  // knex.ts reads DATABASE_URL when the module loads
  function loadKnex(databaseUrl: string) {
    process.env = { ...originalEnv, DATABASE_URL: databaseUrl };
    let knex;
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      knex = require('./knex').default;
    });
    instances.push(knex);
    return knex;
  }

  it('turns on TCP keepalive for the database connections', () => {
    const knex = loadKnex('postgresql://user:secret@db.example:5432/app');

    const settings = knex.client.connectionSettings;
    expect(settings.keepAlive).toBe(true);
    expect(settings.keepAliveInitialDelayMillis).toBe(10000);
  });

  it('still connects to the database of DATABASE_URL', () => {
    const knex = loadKnex(
      'postgresql://user:secret@db.example:25060/app?ssl=true',
    );

    // what the pg driver makes of the settings (no connection is opened)
    const client = new Client(knex.client.connectionSettings);
    expect(client.host).toBe('db.example');
    expect(client.port).toBe(25060);
    expect(client.database).toBe('app');
    expect(client.user).toBe('user');
    expect(client.ssl).toBe(true);
  });
});

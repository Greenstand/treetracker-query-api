import mockDb from 'mock-knex';
import request from 'supertest';
import server from 'app';
import knex from 'infra/database/knex';

describe('organizations list route', () => {
  let tracker: ReturnType<typeof mockDb.getTracker>;

  beforeEach(() => {
    mockDb.mock(knex);
    tracker = mockDb.getTracker();
    tracker.install();
    // Builder queries read the array, raw queries read `.rows`, so answer both.
    tracker.on('query', (query) =>
      query.response(Object.assign([], { rows: [] })),
    );
  });

  afterEach(() => {
    tracker.uninstall();
    mockDb.unmock(knex);
  });

  it.each(['/organizations', '/v2/organizations'])(
    '%s answers when ids is absent',
    async (path) => {
      const res = await request(server).get(`${path}?limit=2&offset=0`);
      expect(res.statusCode).toBe(200);
    },
  );

  it('still filters by ids', async () => {
    const res = await request(server).get('/organizations?ids=[1,2]');
    expect(res.statusCode).toBe(200);
  });
});

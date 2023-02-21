import mockDb from 'mock-knex';
import Session from './Session';
import TreeRepositoryV2 from './TreeRepositoryV2';

describe('TreeRepositoryV2', () => {
  it('getById', async () => {
    const session = new Session();
    mockDb.mock(session.getDB());
    // eslint-disable-next-line
    var tracker = require('mock-knex').getTracker();
     
    tracker.install();
    tracker.on('query', (query) => {
      expect(query.sql).toBe(
        'select * from "treetracker"."tree" where "id" = $1 limit $2',
      );
      query.response([{ id: 'uuid' }]);
    });

    const repo = new TreeRepositoryV2(session);
    const result = await repo.getById('uuid');
    expect(result).toMatchObject({
      id: 'uuid',
    });
  });
});

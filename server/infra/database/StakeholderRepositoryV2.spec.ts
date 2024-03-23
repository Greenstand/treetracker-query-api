import mockDb from 'mock-knex';
import Session from './Session';
import StakeholderRepositoryV2 from './StakeholderRepositoryV2';

describe('StakeholderRepositoryV2', () => {
  it('getById', async () => {
    const session = new Session();
    mockDb.mock(session.getDB());
    // eslint-disable-next-line
    var tracker = require('mock-knex').getTracker();

    tracker.install();
    tracker.on('query', (query) => {
      expect(query.sql).toBe(
        'select * from "stakeholder"."stakeholder" where "id" = $1 limit $2',
      );
      query.response([{ id: 'mock-uuid' }]);
    });

    const repo = new StakeholderRepositoryV2(session);
    const result = await repo.getById('mock-uuid');
    expect(result).toMatchObject({
      id: 'mock-uuid',
    });
  });
});

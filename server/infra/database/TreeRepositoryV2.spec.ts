import Session from './Session';
import TreeRepositoryV2 from './TreeRepositoryV2';

describe('TreeRepositoryV2', () => {
  it('getById', async () => {
    const session = new Session();
    const repo = new TreeRepositoryV2(session);
    const result = await repo.getById('uuid');
    expect(result).toMatchObject({
      id: 'uuid',
    });
  });
});

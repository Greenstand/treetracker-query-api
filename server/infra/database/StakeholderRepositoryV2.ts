import Stakeholder from 'interfaces/Stakeholder';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class StakeholderRepositoryV2 extends BaseRepository<Stakeholder> {
  constructor(session: Session) {
    super('stakeholder.stakeholder', session);
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select()
      .from(this.tableName)
      .where('id', id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}!`);
    }
    return object;
  }
}

import { Planter } from 'models/Planter';
import BaseRepository from './BaseRepository';
import Session from './Session';
import HttpError from '../../utils/HttpError';

export default class PlanterRepository extends BaseRepository<Planter> {
  constructor(session: Session) {
    super('planter', session);
  }

  async getByOrganization(organization_id: number, options: any) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        *
      FROM planter
      LEFT JOIN entity ON entity.id = planter.organization_id
      WHERE entity.id = ${organization_id}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

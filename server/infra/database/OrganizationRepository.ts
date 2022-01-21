import Organization from 'interfaces/Organization';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class OrganizationRepository extends BaseRepository<Organization> {
  constructor(session: Session) {
    super('entity', session);
  }

  async getByPlanter(planter_id: number, options: any) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        *
      FROM entity
      LEFT JOIN planter ON planter.organization_id = entity.id
      WHERE planter.id = ${planter_id}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

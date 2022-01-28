import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class TreeRepository extends BaseRepository<Tree> {
  constructor(session: Session) {
    super('trees', session);
  }

  async getByOrganization(organization_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        *
      FROM trees
      LEFT JOIN planter ON trees.planter_id = planter.id
      LEFT JOIN entity ON entity.id = planter.organization_id
      WHERE entity.id = ${organization_id}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

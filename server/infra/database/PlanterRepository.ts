import FilterOptions from 'interfaces/FilterOptions';
import Planter from 'interfaces/Planter';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class PlanterRepository extends BaseRepository<Planter> {
  constructor(session: Session) {
    super('planter', session);
  }

  async getByOrganization(organization_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        *
      FROM planter
      WHERE planter.organization_id = ${organization_id}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByName(keyword: string, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        *
      FROM planter
      WHERE first_name LIKE '${keyword}%' OR last_name LIKE '${keyword}%'
      ORDER BY first_name, last_name
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getFeaturedPlanters(options: FilterOptions) {
    const { limit } = options;
    const sql = `
      SELECT
      *
      FROM planter
      ORDER BY id DESC
      LIMIT ${limit}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

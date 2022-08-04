import FilterOptions from 'interfaces/FilterOptions';
import Organization from 'interfaces/Organization';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class OrganizationRepository extends BaseRepository<Organization> {
  constructor(session: Session) {
    super('entity', session);
  }

  async getByPlanter(planter_id: number, options: FilterOptions) {
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

  async getFeaturedOrganizations() {
    const sql = `
      select entity.* from entity 
      join (
      --- convert json array to row
      SELECT json_array_elements(data -> 'organizations') AS organization_id FROM webmap.config WHERE name = 'featured-organization'
      ) AS t ON 
      t.organization_id::text::integer = entity.id;
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

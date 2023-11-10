import FilterOptions from 'interfaces/FilterOptions';
import Species from 'interfaces/Species';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class SpeciesRepository extends BaseRepository<Species> {
  constructor(session: Session) {
    super('tree_species', session);
  }

  async getByOrganization(organization_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT 
      species_id as id, total, ts.name, ts.desc
      FROM 
      (
      SELECT 
      ss.species_id, count(ss.species_id) as total
      from webmap.species_stat ss
      WHERE
      ss.planter_id IN (
        SELECT
          id
        FROM planter p
        WHERE
            p.organization_id in ( SELECT entity_id from getEntityRelationshipChildren(${organization_id}))
      )
      OR
        ss.planting_organization_id = ${organization_id}
      GROUP BY ss.species_id
      ) s_count
      JOIN tree_species ts
      ON ts.id = s_count.species_id
      ORDER BY total DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async countByOrganization(organization_id: number) {
    const totalSql = `
    SELECT 
      species_id as id, total, ts.name, ts.desc
      FROM 
      (
      SELECT 
      ss.species_id, count(ss.species_id) as total
      from webmap.species_stat ss
      WHERE
      ss.planter_id IN (
        SELECT
          id
        FROM planter p
        WHERE
            p.organization_id in ( SELECT entity_id from getEntityRelationshipChildren(${organization_id}))
      )
      OR
        ss.planting_organization_id = ${organization_id}
      GROUP BY ss.species_id
      ) s_count
      JOIN tree_species ts
      ON ts.id = s_count.species_id
      ORDER BY total DESC

    `;
    const total = await this.session.getDB().raw(totalSql);
    return parseInt(total.rows.length);
  }

  async getByPlanter(planter_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT 
      species_id as id, total, ts.name, ts.desc
      FROM 
      (
      SELECT 
      ss.species_id, count(ss.species_id) as total
      from webmap.species_stat ss
      WHERE
      ss.planter_id = ${planter_id}
      GROUP BY ss.species_id
      ) s_count
      JOIN tree_species ts
      ON ts.id = s_count.species_id
      ORDER BY total DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByWallet(wallet_id: string, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT 
      species_id as id, total, ts.name, ts.desc
      FROM 
      (
      SELECT 
      ss.species_id, count(ss.species_id) as total
      from webmap.species_stat ss
      WHERE
      ss.wallet_id::text = '${wallet_id}'
      GROUP BY ss.species_id
      ) s_count
      JOIN tree_species ts
      ON ts.id = s_count.species_id
      ORDER BY total DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

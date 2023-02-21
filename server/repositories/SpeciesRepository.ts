import FilterOptions from 'interfaces/FilterOptions';
import Species from 'interfaces/Species';
import BaseRepository from './BaseRepository';
import Session from 'infra/database/Session';

export default class SpeciesRepository extends BaseRepository<Species> {
  constructor(session: Session) {
    super('tree_species', session);
  }

  async getByOrganization(
    organization_id: number,
    options: FilterOptions,
  ): Promise<{ species: Species[]; count: number }> {
    const { limit, offset } = options;
    const sql = `
      SELECT 
        species_id as id, 
        total, 
        ts.name, 
        ts.desc, 
        ts.active,
        ts.value_factor,
        ts.uuid
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
    const knex = this.session.getDB();
    const count = await knex.select(
      knex.raw(`count(*) from (${sql}) as count`),
    );

    const object = await knex.raw(sql);
    return { species: object.rows, count: +count[0].count };
  }

  async getByPlanter(
    planter_id: number,
    options: FilterOptions,
  ): Promise<{ species: Species[]; count: number }> {
    const { limit, offset } = options;
    const sql = `
      SELECT 
        species_id as id, 
        total, 
        ts.name, 
        ts.desc, 
        ts.active,
        ts.value_factor,
        ts.uuid
      FROM 
      (
        SELECT 
          ss.species_id, count(ss.species_id) as total
        FROM webmap.species_stat ss
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
    const knex = this.session.getDB();
    const count = await knex.select(
      knex.raw(`count(*) from (${sql}) as count`),
    );

    const object = await knex.raw(sql);
    return { species: object.rows, count: +count[0].count };
  }

  async getByWallet(
    wallet_id: string,
    options: FilterOptions,
  ): Promise<{ species: Species[]; count: number }> {
    const { limit, offset } = options;
    const sql = `
      SELECT 
        species_id as id, 
        total, 
        ts.name, 
        ts.desc, 
        ts.active,
        ts.value_factor,
        ts.uuid
      FROM 
      (
        SELECT 
          ss.species_id, count(ss.species_id) as total
        FROM webmap.species_stat ss
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
    const knex = this.session.getDB();
    const count = await knex.select(
      knex.raw(`count(*) from (${sql}) as count`),
    );

    const object = await knex.raw(sql);
    return { species: object.rows, count: +count[0].count };
  }
}

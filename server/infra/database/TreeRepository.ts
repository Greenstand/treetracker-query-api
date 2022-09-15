import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class TreeRepository extends BaseRepository<Tree> {
  constructor(session: Session) {
    super('trees', session);
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
          trees.*,
          tree_species.id as species_id,
          tree_species.name as species_name,
          region.name as country_name,
          region.id as country_id,
          entity.id as organization_id,
          entity.name as organization_name,
          wallet.wallet.id as wallet_id,
          wallet.wallet.name as wallet_name,
          wallet.token.id as token_id
          from trees
            left JOIN planter 
              on trees.planter_id = planter.id
            left JOIN entity 
              on entity.id = planter.organization_id
            left JOIN tree_species 
              on trees.species_id = tree_species.id 
            left JOIN region
              on ST_WITHIN(trees.estimated_geometric_location, region.geom)
              and region.type_id in (select id from region_type where type = 'country')
            left JOIN wallet.token
              on wallet.token.capture_id::text = trees.uuid::text
            left JOIN wallet.wallet
              on wallet.token.wallet_id = wallet.wallet.id
      `),
      )
      .where('trees.id', id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }

  async getByOrganization(organization_id: number, options: FilterOptions, totalCount = false) {
    const { limit, offset } = options;
    
    if(totalCount) {
      const totalSql = `
        SELECT
          COUNT(*)
        FROM trees
        LEFT JOIN planter ON trees.planter_id = planter.id
        LEFT JOIN entity ON entity.id = planter.organization_id
        WHERE entity.id = ${organization_id}
      `;
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }

    const sql = `
      SELECT
      trees.*,
      entity.id as organization_id,
      entity.name as organization_name  
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

  async getByDateRange(
    date_range: { startDate: string; endDate: string },
    options: FilterOptions,
    totalCount = false
  ) {
    const { limit, offset } = options;
    const startDateISO = `${date_range.startDate}T00:00:00.000Z`;
    const endDateISO = new Date(
      new Date(`${date_range.endDate}T00:00:00.000Z`).getTime() + 86400000,
    ).toISOString();
    
    if(totalCount) {
      const totalSql = `
        SELECT
        COUNT(*)
        FROM trees
        WHERE time_created >= '${startDateISO}'::timestamp
        AND time_created < '${endDateISO}'::timestamp
      `;
      const total = await this.session.getDB().raw(totalCount);
      return parseInt(total.rows[0].count.toString());
    }

    const sql = `
      SELECT
        *
      FROM trees
      WHERE time_created >= '${startDateISO}'::timestamp
      AND time_created < '${endDateISO}'::timestamp
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByTag(tag: string, options: FilterOptions, totalCount = false) {
    const { limit, offset } = options;

    if(totalCount) {
      const totalSql = `
      SELECT 
        COUNT(*)
      FROM trees
      INNER JOIN tree_tag 
        on tree_tag.tree_id = trees.id
      INNER JOIN tag 
        on tree_tag.tag_id = tag.id
      WHERE 
        tag.tag_name in ('${tag}')
      `;
      const total = await this.session.getDB().raw(totalCount);
      return parseInt(total.rows[0].count.toString());
    }
    const sql = `
    SELECT 
      trees.*
    FROM trees
    INNER JOIN tree_tag 
      on tree_tag.tree_id = trees.id
    INNER JOIN tag 
      on tree_tag.tag_id = tag.id
    WHERE 
      tag.tag_name in ('${tag}')
    LIMIT ${limit}
    OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getFeaturedTree() {
    const sql = `
      SELECT trees.* ,tree_species.name as species_name
      FROM trees 
      join (
      --- convert json array to row
      SELECT json_array_elements(data -> 'trees') AS tree_id FROM webmap.config WHERE name = 'featured-tree'
      ) AS t ON 
      --- cast json type t.tree_id to integer
      t.tree_id::text::integer = trees.id
      LEFT JOIN tree_species 
      ON trees.species_id = tree_species.id;
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

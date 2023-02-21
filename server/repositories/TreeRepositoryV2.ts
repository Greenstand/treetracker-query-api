import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class TreeRepositoryV2 extends BaseRepository<Tree> {
  constructor(session: Session) {
    super('treetracker.tree', session);
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

  async getByOrganization(
    organization_id: number,
    options: FilterOptions,
    totalCount = false,
  ) {
    const { limit, offset } = options;

    if (totalCount) {
      const totalSql = `
        SELECT
          COUNT(*)
        FROM trees
        LEFT JOIN planter ON trees.planter_id = planter.id
        WHERE
          planter.organization_id in ( SELECT entity_id from getEntityRelationshipChildren(${organization_id}))
      `;
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }

    const sql = `
      SELECT
      trees.*,
      tree_species.id as species_id,
      tree_species.name as species_name,
      region.id as country_id,
      region.name as country_name,
      entity.id as organization_id,
      entity.name as organization_name
      FROM trees
      LEFT JOIN planter ON trees.planter_id = planter.id
      LEFT JOIN entity ON entity.id = planter.organization_id
      LEFT JOIN tree_species 
        on trees.species_id = tree_species.id 
      LEFT JOIN region
        on ST_WITHIN(trees.estimated_geometric_location, region.geom)
        and region.type_id in (select id from region_type where type = 'country')
      WHERE
        planter.organization_id in ( SELECT entity_id from getEntityRelationshipChildren(${organization_id}))
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByDateRange(
    date_range: { startDate: string; endDate: string },
    options: FilterOptions,
    totalCount = false,
  ) {
    const { limit, offset } = options;
    const startDateISO = `${date_range.startDate}T00:00:00.000Z`;
    const endDateISO = new Date(
      new Date(`${date_range.endDate}T00:00:00.000Z`).getTime() + 86400000,
    ).toISOString();

    if (totalCount) {
      const totalSql = `
        SELECT
        COUNT(*)
        FROM trees
        WHERE time_created >= '${startDateISO}'::timestamp
        AND time_created < '${endDateISO}'::timestamp
      `;
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }

    const sql = `
      SELECT
      trees.*,
      tree_species.id as species_id,
      tree_species.name as species_name,
      region.id as country_id,
      region.name as country_name,
      entity.id as organization_id,
      entity.name as organization_name
      FROM trees
      LEFT JOIN planter ON trees.planter_id = planter.id
      LEFT JOIN entity ON entity.id = planter.organization_id
      LEFT JOIN tree_species 
        on trees.species_id = tree_species.id 
      LEFT JOIN region
        on ST_WITHIN(trees.estimated_geometric_location, region.geom)
        and region.type_id in (select id from region_type where type = 'country')
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

    if (totalCount) {
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
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }
    const sql = `
    SELECT 
    trees.*,
    tree_species.id as species_id,
    tree_species.name as species_name,
    region.id as country_id,
    region.name as country_name,
    entity.id as organization_id,
    entity.name as organization_name
    FROM trees
    LEFT JOIN planter ON trees.planter_id = planter.id
    LEFT JOIN entity ON entity.id = planter.organization_id
    LEFT JOIN tree_species 
      on trees.species_id = tree_species.id 
    LEFT JOIN region
      on ST_WITHIN(trees.estimated_geometric_location, region.geom)
      and region.type_id in (select id from region_type where type = 'country')
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
      SELECT trees.* ,tree_species.name as species_name,
      country.id as country_id, country.name as country_name
      FROM trees 
      join (
      --- convert json array to row
      SELECT json_array_elements(data -> 'trees') AS tree_id FROM webmap.config WHERE name = 'featured-tree'
      ) AS t ON 
      --- cast json type t.tree_id to integer
      t.tree_id::text::integer = trees.id
      LEFT JOIN tree_species 
      ON trees.species_id = tree_species.id
      LEFT JOIN region as country ON ST_WITHIN(trees.estimated_geometric_location, country.geom)
            and country.type_id in
              (SELECT id FROM region_type WHERE type = 'country')
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByWallet(
    wallet_id: string,
    options: FilterOptions,
    totalCount = false,
  ) {
    const { limit, offset } = options;

    if (totalCount) {
      const totalSql = `
        SELECT
          COUNT(*)
        FROM trees
        LEFT JOIN wallet.token ON token.capture_id::text = trees.uuid
        WHERE wallet.token.wallet_id = '${wallet_id}'
      `;
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }

    const sql = `
      SELECT
      trees.*
      FROM trees
      LEFT JOIN wallet.token ON token.capture_id::text = trees.uuid
      WHERE wallet.token.wallet_id = '${wallet_id}'
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

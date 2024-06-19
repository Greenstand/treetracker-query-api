import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class TreeRepository extends BaseRepository<Tree> {
  constructor(session: Session) {
    super('denormalized.trees_denormalized', session);
  }

  async getById(id: number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        td.*, td.planting_organization_id as organization_id, td.species as species_name,
        o."name" as organization_name, r."name" as country_name, ts."desc" as species_desc, w."name" as wallet_name  
        FROM
         denormalized.trees_denormalized td 
        LEFT JOIN public.organizations o 
          on td.planting_organization_id = o.id 
        LEFT JOIN public.region r 
          on  td.country_id = cast(r."metadata" ->>'id' as integer)
        LEFT JOIN public.tree_species ts 
          on ts.id = td.species_id
        LEFT JOIN wallet.wallet w
          on w.id = td.wallet_id
      `),
      )
      .where('r.type_id', 6)
      .where('td.id', id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }

  async getByUUID(uuid: string) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        td.*, td.planting_organization_id as organization_id, td.species as species_name,
        o."name" as organization_name, r."name" as country_name, ts."desc" as species_desc, w."name" as wallet_name  
        FROM
         denormalized.trees_denormalized td 
        LEFT JOIN public.organizations o 
          on td.planting_organization_id = o.id 
        LEFT JOIN public.region r 
          on  td.country_id = cast(r."metadata" ->>'id' as integer)
        LEFT JOIN public.tree_species ts 
          on ts.id = td.species_id
        LEFT JOIN wallet.wallet w
          on w.id = td.wallet_id
      `),
      )
      .where('r.type_id', 6)
      .where('td.uuid', uuid)
      .first();

    if (!object) {
      throw new HttpError(
        404,
        `Can not find ${this.tableName} by uuid:${uuid}`,
      );
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
        count(*) 
      FROM 
        denormalized.trees_denormalized td 
      WHERE 
        td.active = true
        and td.planting_organization_id = ${organization_id} 
      `;
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }

    const sql = `
    SELECT 
      td.*, td.planting_organization_id as organization_id, td.species as species_name,
      o."name" as organization_name, r."name" as country_name, ts."desc" as species_desc, w."name" as wallet_name 
    FROM
     denormalized.trees_denormalized td 
    LEFT JOIN public.organizations o 
      on td.planting_organization_id = o.id 
    LEFT JOIN public.region r 
      on  td.country_id = cast(r."metadata" ->>'id' as integer) 
    LEFT JOIN public.tree_species ts
      on ts.id = td.species_id
    LEFT JOIN wallet.wallet w
      on w.id = td.wallet_id
    WHERE 
      r.type_id = 6 
      and td.planting_organization_id = ${organization_id}
      and td.active = true 
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
      FROM denormalized.trees_denormalized td
      WHERE 
        td.time_created >= '${startDateISO}'::timestamp
        and td.time_created < '${endDateISO}'::timestamp
        and td.active = true
      `;
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }

    const sql = `
    SELECT 
      td.*, td.planting_organization_id as organization_id, td.species as species_name,
      o."name" as organization_name, r."name" as country_name, ts."desc" as species_desc, w."name" as wallet_name 
    FROM
     denormalized.trees_denormalized td 
    LEFT JOIN public.organizations o 
      on td.planting_organization_id = o.id 
    LEFT JOIN public.region r 
      on  td.country_id = cast(r."metadata" ->>'id' as integer) 
    LEFT JOIN public.tree_species ts
      on ts.id = td.species_id
    LEFT JOIN wallet.wallet w
      on w.id = td.wallet_id
    WHERE 
      r.type_id = 6 
      and td.time_created >= '${startDateISO}'::timestamp
      and td.time_created < '${endDateISO}'::timestamp
      and td.active = true
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
      FROM denormalized.trees_denormalized td
      INNER JOIN public.tree_tag tt
        on tt.tree_id = td.id
      INNER JOIN tag t
        on tt.tag_id = t.id
      WHERE 
        t.tag_name in ('${tag}')
        and td.active = true
      `;
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }
    const sql = `
    SELECT 
      td.*, td.planting_organization_id as organization_id, td.species as species_name,
      o."name" as organization_name, r."name" as country_name, ts."desc" as species_desc, w."name" as wallet_name 
    FROM
     denormalized.trees_denormalized td 
    LEFT JOIN public.organizations o 
      on td.planting_organization_id = o.id 
    LEFT JOIN public.region r 
      on  td.country_id = cast(r."metadata" ->>'id' as integer) 
    LEFT JOIN public.tree_species ts
      on ts.id = td.species_id
    LEFT JOIN wallet.wallet w
      on w.id = td.wallet_id
    INNER JOIN tree_tag tt 
      on tt.tree_id = td.id
    INNER JOIN tag t 
      on tt.tag_id = t.id
    WHERE 
      t.tag_name in ('${tag}')
      and td.active = true
    LIMIT ${limit}
    OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getFeaturedTree() {
    const sql = `
    SELECT 
    td.*, td.planting_organization_id as organization_id, td.species as species_name,
    o."name" as organization_name, r."name" as country_name, ts."desc" as species_desc, w."name" as wallet_name 
    FROM
    denormalized.trees_denormalized td 
    LEFT JOIN public.organizations o 
      on td.planting_organization_id = o.id 
    LEFT JOIN public.region r 
      on  td.country_id = cast(r."metadata" ->>'id' as integer) 
    LEFT JOIN public.tree_species ts
      on ts.id = td.species_id
    LEFT JOIN wallet.wallet w
      on w.id = td.wallet_id
    JOIN (
      --- convert json array to row
      SELECT json_array_elements(data -> 'trees') AS tree_id FROM webmap.config WHERE name = 'featured-tree'
      ) AS t ON 
      --- cast json type t.tree_id to integer
      t.tree_id::text::integer = td.id
      WHERE
        r.type_id = 6
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
        FROM denormalized.trees_denormalized td
        WHERE 
          td.wallet_id = '${wallet_id}'
          and td.active = true
      `;
      const total = await this.session.getDB().raw(totalSql);
      return parseInt(total.rows[0].count.toString());
    }

    const sql = `
    SELECT 
    td.*, td.planting_organization_id as organization_id, td.species as species_name,
    o."name" as organization_name, r."name" as country_name, ts."desc" as species_desc, w."name" as wallet_name 
    FROM
    denormalized.trees_denormalized td 
    LEFT JOIN public.organizations o 
      on td.planting_organization_id = o.id 
    LEFT JOIN public.region r 
      on  td.country_id = cast(r."metadata" ->>'id' as integer) 
    LEFT JOIN public.tree_species ts
      on ts.id = td.species_id
    LEFT JOIN wallet.wallet w
      on w.id = td.wallet_id
    WHERE 
      r.type_id = 6 
      and td.wallet_id = '${wallet_id}'
      and td.active = true
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

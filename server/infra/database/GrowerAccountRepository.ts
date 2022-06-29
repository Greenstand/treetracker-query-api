import FilterOptions from 'interfaces/FilterOptions';
import GrowerAccount from 'interfaces/GrowerAccount';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class GrowerAccountRepository extends BaseRepository<GrowerAccount> {
  constructor(session: Session) {
    super('grower_account', session);
    this.tableName = 'treetracker.grower_account';
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        ${this.tableName}.*,
        stakeholder.org_name as organization,
        LEFT JOIN treetracker.capture AS tc
          ON treetracker.grower_account.id = tc.grower_account_id
        LEFT JOIN regions.region AS country
          ON ST_WITHIN(c.estimated_geometric_location, country.geom)
          AND country.type_id IN
            (select id FROM region_type WHERE type = 'country')
        LEFT JOIN regions.region AS continent
          ON ST_WITHIN(tc.estimated_geometric_location, continent.geom)
          AND continent.type_id IN
            (select id FROM region_type WHERE type = 'continents' )
        LEFT JOIN stakeholder.stakeholder AS stakeholder
          ON stakeholder.id = treetracker.grower_account.organization_id
        LEFT JOIN messaging.author AS author
          ON author.handle = treetracker.grower_account.wallet
      `),
      )
      .where('planter.id', id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }

  async getByOrganization(organization_id: number, options: FilterOptions) {
    // const { limit, offset } = options;
    // const sql = `
    //   SELECT
    //     *
    //   FROM ${this.tableName} AS gc
    //   WHERE gc.organization_id = ${organization_id}
    //   LIMIT ${limit}
    //   OFFSET ${offset}
    // `;
    const sql = `
        ${this.tableName}.*,
        stakeholder.org_name as organization,
        LEFT JOIN treetracker.capture AS tc
          ON treetracker.grower_account.id = tc.grower_account_id
        LEFT JOIN regions.region AS country
          ON ST_WITHIN(c.estimated_geometric_location, country.geom)
          AND country.type_id IN
            (select id FROM region_type WHERE type = 'country')
        LEFT JOIN regions.region AS continent
          ON ST_WITHIN(tc.estimated_geometric_location, continent.geom)
          AND continent.type_id IN
            (select id FROM region_type WHERE type = 'continents' )
        LEFT JOIN stakeholder.stakeholder AS stakeholder
          ON stakeholder.id = treetracker.grower_account.organization_id
        LEFT JOIN messaging.author AS author
          ON author.handle = treetracker.grower_account.wallet
    `;
    let promise = this.session.getDB().select(this.session.getDB().raw(sql));
    const { limit, offset } = options;
    if (limit) {
      promise = promise.limit(limit);
    }
    if (offset) {
      promise = promise.offset(offset);
    }
    const growers = await promise;
    console.log('growers', growers);
    return growers;
  }

  async getByName(keyword: string, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        *
      FROM ${this.tableName}
      WHERE first_name LIKE '${keyword}%' OR last_name LIKE '${keyword}%'
      ORDER BY first_name, last_name
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getFeaturedGrowerAccounts(options: FilterOptions) {
    const { limit } = options;
    const sql = `
      SELECT
      *
      FROM ${this.tableName}
      ORDER BY id DESC
      LIMIT ${limit}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}

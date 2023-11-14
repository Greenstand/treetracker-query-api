import FilterOptions from 'interfaces/FilterOptions';
import GrowerAccount from 'interfaces/GrowerAccount';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';
import GrowerAccountFilter from '../../interfaces/GrowerAccountFilter';

export default class GrowerAccountRepository extends BaseRepository<GrowerAccount> {
  constructor(session: Session) {
    super('grower_account', session);
    this.tableName = 'treetracker.grower_account';
  }

  filterWhereBuilder(object, builder) {
    const result = builder;
    const {
      whereNulls = [],
      whereNotNulls = [],
      whereIns = [],
      ...parameters
    } = object;

    result.whereNot(`${this.tableName}.status`, 'deleted');
    whereNotNulls.forEach((whereNot) => {
      result.whereNotNull(whereNot);
    });

    whereNulls.forEach((whereNull) => {
      result.whereNull(whereNull);
    });

    whereIns.forEach((whereIn) => {
      result.whereIn(whereIn.field, whereIn.values);
    });

    const filterObject = { ...parameters };

    if (filterObject.id) {
      result.where(`${this.tableName}.id`, '=', filterObject.id);
      delete filterObject.id;
    }

    if (filterObject.reference_id) {
      result.where(
        `${this.tableName}.reference_id`,
        '=',
        filterObject.reference_id,
      );
      delete filterObject.reference_id;
    }

    if (filterObject.first_name) {
      result.where(
        `${this.tableName}.first_name`,
        'ilike',
        `%${filterObject.first_name}%`,
      );
      delete filterObject.first_name;
    }

    if (filterObject.last_name) {
      result.where(
        `${this.tableName}.last_name`,
        'ilike',
        `%${filterObject.last_name}%`,
      );
      delete filterObject.last_name;
    }

    if (filterObject.person_id) {
      filterObject[`${this.tableName}.person_id`] = filterObject.person_id;
      delete filterObject.person_id;
    }

    if (filterObject.email) {
      result.where(
        `${this.tableName}.email`,
        'ilike',
        `%${filterObject.email}%`,
      );
      delete filterObject.email;
    }

    if (filterObject.phone) {
      result.where(
        `${this.tableName}.phone`,
        'ilike',
        `%${filterObject.phone}%`,
      );
      delete filterObject.phone;
    }

    if (filterObject.device_identifier) {
      result.where(
        `field_data.device_configuration.device_identifier`,
        'ilike',
        `%${filterObject.device_identifier}%`,
      );
      delete filterObject.device_identifier;
    }

    if (filterObject.organization_id) {
      result.whereIn(
        `${this.tableName}.organization_id`,
        filterObject.organization_id,
      );
      delete filterObject.organization_id;
    }

    // if 'captures_amount_max' === 0, 'captures_amount_min' can be only 0.
    if (filterObject.captures_amount_max === 0) {
      result.whereNull('c.captures_count');
      delete filterObject.captures_amount_min;
      delete filterObject.captures_amount_max;
    }

    // if 'captures_amount_max' === 0 and 'captures_amount_max' is not defined, all results should be returned.
    if (
      filterObject.captures_amount_min === 0 &&
      !filterObject.captures_amount_max
    ) {
      delete filterObject.captures_amount_min;
      delete filterObject.captures_amount_max;
    }

    if (filterObject.captures_amount_min) {
      result.where(
        `c.captures_count`,
        '>=',
        `${filterObject.captures_amount_min}`,
      );
      delete filterObject.captures_amount_min;
    }

    if (filterObject.captures_amount_max) {
      result.where(
        `c.captures_count`,
        '<=',
        `${filterObject.captures_amount_max}`,
      );
      delete filterObject.captures_amount_max;
    }

    if (filterObject.wallet) {
      result.where(
        `${this.tableName}.wallet`,
        'ilike',
        `%${filterObject.wallet}%`,
      );
      delete filterObject.wallet;
    }

    result.where(filterObject);
  }

  async getCount(filter: GrowerAccountFilter) {
    const knex = this.session.getDB();

    const result = await knex
      .select(
        knex.raw(`
        COUNT(DISTINCT(${this.tableName}.id)) AS count
        FROM ${this.tableName}
        LEFT JOIN treetracker.capture AS tc
          ON ${this.tableName}.id = tc.grower_account_id
        LEFT JOIN field_data.device_configuration
          ON field_data.device_configuration.id = tc.device_configuration_id
        LEFT JOIN stakeholder.stakeholder AS s
          ON s.id = ${this.tableName}.organization_id
        LEFT JOIN messaging.author AS author
          ON author.handle = ${this.tableName}.wallet
        LEFT JOIN (
          SELECT grower_account_id, COUNT(*) AS captures_count
          FROM treetracker.capture
          GROUP BY grower_account_id
        ) c ON ${this.tableName}.id = c.grower_account_id
    `),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder))
      .first();

    return result;
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        ${this.tableName}.*,
        s.org_name as organization,
        d.device_configurations as devices,
        r.regions AS regions
        FROM ${this.tableName}
        LEFT JOIN treetracker.capture AS tc
          ON ${this.tableName}.id = tc.grower_account_id
        LEFT JOIN field_data.device_configuration
          ON field_data.device_configuration.id = tc.device_configuration_id
        LEFT JOIN (
          SELECT tc.grower_account_id, ARRAY_AGG(DISTINCT(r.name)) AS regions
          FROM treetracker.capture AS tc
          JOIN regions.region AS r
            ON ST_WITHIN(tc.estimated_geometric_location, r.shape)
          GROUP BY tc.grower_account_id
          ) r ON ${this.tableName}.id = tc.grower_account_id
        LEFT JOIN stakeholder.stakeholder AS s
          ON s.id = ${this.tableName}.organization_id
        LEFT JOIN messaging.author AS author
          ON author.handle = ${this.tableName}.wallet
        LEFT JOIN (
          SELECT tc.grower_account_id, ARRAY_AGG(row_to_json(dc.*)) AS device_configurations
          FROM treetracker.capture AS tc
          JOIN field_data.device_configuration AS dc
            ON dc.id = tc.device_configuration_id
          GROUP BY tc.grower_account_id
        ) d ON ${this.tableName}.id = tc.grower_account_id
      `),
      )
      .where(`${this.tableName}.id`, id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }

  async getSelfiesById(id: string) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        s.selfies AS selfies
        FROM ${this.tableName}
        LEFT JOIN stakeholder.stakeholder AS stakeholder
          ON stakeholder.id = ${this.tableName}.organization_id
        LEFT JOIN (
          SELECT wr.grower_account_id, ARRAY_AGG(DISTINCT(check_in_photo_url)) AS selfies
          FROM field_data.session AS s
          JOIN field_data.wallet_registration AS wr
            ON s.originating_wallet_registration_id = wr.id
          GROUP BY wr.grower_account_id
        ) s ON ${this.tableName}.id = s.grower_account_id
      `),
      )
      .where(`${this.tableName}.id`, id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }

  // is there any benefit to have this separate from getByFilter?
  async getByOrganization(organization_id: string, options: FilterOptions) {
    const sql = `
        ${this.tableName}.*,
        stakeholder.org_name as organization
        FROM ${this.tableName}
        LEFT JOIN stakeholder.stakeholder AS stakeholder
          ON stakeholder.id = ${this.tableName}.organization_id
    `;
    let promise = this.session
      .getDB()
      .select(this.session.getDB().raw(sql))
      .where(`${this.tableName}.organization_id`, organization_id);

    const { limit, offset } = options;
    if (limit) {
      promise = promise.limit(limit);
    }
    if (offset) {
      promise = promise.offset(offset);
    }
    const growers = await promise;
    return growers;
  }

  async getByFilter(filter: GrowerAccountFilter, options: FilterOptions) {
    let promise = this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        ${this.tableName}.*,
        s.org_name as organization,
        d.device_configurations as devices,
        r.regions AS regions,
        COALESCE(c.captures_count, 0) AS captures
        FROM ${this.tableName}
        LEFT JOIN treetracker.capture AS tc
          ON ${this.tableName}.id = tc.grower_account_id
        LEFT JOIN field_data.device_configuration
          ON field_data.device_configuration.id = tc.device_configuration_id
        LEFT JOIN (
          SELECT tc.grower_account_id, ARRAY_AGG(DISTINCT(r.name)) AS regions
          FROM treetracker.capture AS tc
          JOIN regions.region AS r
            ON ST_WITHIN(tc.estimated_geometric_location, r.shape)
          GROUP BY tc.grower_account_id
          ) r ON ${this.tableName}.id = tc.grower_account_id
        LEFT JOIN stakeholder.stakeholder AS s
          ON s.id = ${this.tableName}.organization_id
        LEFT JOIN messaging.author AS author
          ON author.handle = ${this.tableName}.wallet
        LEFT JOIN (
          SELECT grower_account_id, COUNT(*) AS captures_count
          FROM treetracker.capture
          GROUP BY grower_account_id
        ) c ON ${this.tableName}.id = c.grower_account_id
        LEFT JOIN (
          SELECT tc.grower_account_id, ARRAY_AGG(row_to_json(dc.*)) AS device_configurations
          FROM treetracker.capture AS tc
          JOIN field_data.device_configuration AS dc
            ON dc.id = tc.device_configuration_id
          GROUP BY tc.grower_account_id
        ) d ON ${this.tableName}.id = tc.grower_account_id
    `),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder))
      .distinctOn(`${this.tableName}.id`);

    const { limit, offset } = options;
    if (limit) {
      promise = promise.limit(limit);
    }
    if (offset) {
      promise = promise.offset(offset);
    }
    const growers = await promise;
    return growers;
  }

  async getByName(keyword: string, options: FilterOptions) {
    const { limit, offset } = options;

    const object = await this.session.getDB().raw(`
      SELECT
        *
      FROM ${this.tableName}
      WHERE first_name LIKE '${keyword}%' OR last_name LIKE '${keyword}%'
      ORDER BY first_name, last_name
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    return object.rows;
  }

  async getFeaturedGrowerAccounts(options: FilterOptions) {
    const { limit } = options;

    const object = await this.session.getDB().raw(`
      SELECT
      *
      FROM ${this.tableName}
      ORDER BY id DESC
      LIMIT ${limit}
    `);

    return object.rows;
  }

  async getWalletsCount(filter: GrowerAccountFilter) {
    const knex = this.session.getDB();
    const result = await knex
      .select(
        knex.raw(`
        COUNT(${this.tableName}.id) AS count
        FROM ${this.tableName}
    `),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder))
      .first();

    return result;
  }

  async getWalletsByFilter(
    filter: GrowerAccountFilter,
    options: FilterOptions,
  ) {
    let promise = this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        ${this.tableName}.wallet
        FROM ${this.tableName}
    `),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder))
      .orderBy(`${this.tableName}.wallet`);

    const { limit, offset } = options;
    if (limit) {
      promise = promise.limit(limit);
    }
    if (offset) {
      promise = promise.offset(offset);
    }

    const wallets = await promise;
    return wallets;
  }
}

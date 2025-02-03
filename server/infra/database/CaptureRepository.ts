import Capture from 'interfaces/Capture';
import CaptureFilter from 'interfaces/CaptureFilter';
import FilterOptions from 'interfaces/FilterOptions';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class CaptureRepository extends BaseRepository<Capture> {
  constructor(session: Session) {
    super('capture', session);
    this.tableName = 'treetracker.capture';
  }

  filterWhereBuilder(object, builder) {
    const result = builder;
    const { ...parameters } = object;

    // parse the nested values, if there
    const whereNulls = object.whereNulls ? JSON.parse(object.whereNulls) : [];
    const whereNotNulls = object.whereNotNulls
      ? JSON.parse(object.whereNotNulls)
      : [];
    const whereIns = object.whereIns ? JSON.parse(object.whereIns) : [];

    if (parameters.tokenized === 'true') {
      whereNotNulls.push('wallet.token.id');
    } else if (parameters.tokenized === 'false') {
      whereNulls.push('wallet.token.id');
    }
    delete parameters.tokenized;

    result.whereNot(`${this.tableName}.status`, 'deleted');

    whereNotNulls.forEach((whereNot) => {
      // to map table names to fields for query
      switch (true) {
        case whereNot === 'tag_id':
          result.whereNotNull('treetracker.capture_tag.tag_id');
          break;
        default:
          result.whereNotNull(whereNot);
      }

      // result.whereNotNull(whereNot);
    });

    whereNulls.forEach((whereNull) => {
      // to map table names to fields for query
      switch (true) {
        case whereNull === 'tag_id':
          result.whereNull('treetracker.capture_tag.tag_id');
          break;
        default:
          result.whereNull(whereNull);
      }
      // result.whereNull(whereNull);
    });

    whereIns.forEach((whereIn) => {
      result.whereIn(whereIn.field, whereIn.values);
    });

    const filterObject = { ...parameters };

    if (filterObject.startDate) {
      result.where(
        `${this.tableName}.captured_at`,
        '>=',
        filterObject.startDate,
      );
      delete filterObject.startDate;
    }
    if (filterObject.endDate) {
      result.where(`${this.tableName}.captured_at`, '<=', filterObject.endDate);
      delete filterObject.endDate;
    }

    if (filterObject.tag_id) {
      filterObject[`treetracker.capture_tag.tag_id`] = filterObject.tag_id;
      delete filterObject.tag_id;
    }

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

    if (filterObject.grower_reference_id) {
      result.where(
        `treetracker.grower_account.reference_id`,
        '=',
        filterObject.grower_reference_id,
      );
      delete filterObject.grower_reference_id;
    }

    if (filterObject.organization_id) {
      result.where(`${this.tableName}.planting_organization_id`, 'in', [
        ...filterObject.organization_id,
      ]);
      delete filterObject.organization_id;
    }

    // if we want to allow the client to pass more than one org id

    // if (filterObject.organization_ids) {
    //   result.where(
    //     `${this.tableName}.planting_organization_id`,
    //     'in',
    //     filterObject.organization_ids.split(','),
    //   );
    //   delete filterObject.organization_ids;
    // }

    if (filterObject.session_id) {
      result.where(
        `${this.tableName}.session_id`,
        '=',
        filterObject.session_id,
      );
      delete filterObject.session_id;
    }

    result.where(filterObject);
  }

  async getByFilter(filterCriteria: CaptureFilter, options: FilterOptions) {
    const knex = this.session.getDB();
    const { sort, ...filter } = filterCriteria;

    // there are two joins to connect the capture to the token and to the wallet right now so that we can double check our data entries
    // the current data entered in the tables doesn't match up so there are some mismatches
    let promise = knex
      .select(
        knex.raw(
          `
            treetracker.capture.*,
            t.tags,
            field_data.device_configuration.device_identifier,
            treetracker.grower_account.wallet,
            treetracker.grower_account.reference_id as grower_reference_id,
            wt.wallet_name,
            wt.token_id,
            tk.id AS wallet_token_id
          FROM treetracker.capture
          LEFT JOIN (
              SELECT ct.capture_id, array_agg(t.name) AS tags
              FROM treetracker.capture_tag ct
              JOIN treetracker.tag t ON t.id = ct.tag_id
              GROUP BY ct.capture_id
            ) t ON treetracker.capture.id = t.capture_id
          LEFT JOIN field_data.device_configuration
              ON field_data.device_configuration.id = treetracker.capture.device_configuration_id
          LEFT JOIN treetracker.grower_account
              ON grower_account.id = treetracker.capture.grower_account_id
          LEFT JOIN wallet.token tk
              ON treetracker.capture.id = tk.capture_id
          LEFT JOIN (
              SELECT ga.id, w.name AS wallet_name, t.id AS token_id
              FROM wallet.wallet w
              JOIN wallet.token t ON t.wallet_id = w.id
              JOIN treetracker.grower_account ga ON ga.wallet = w.name
            ) wt ON treetracker.capture.grower_account_id = wt.id
          LEFT JOIN treetracker.capture_tag
              on treetracker.capture_tag.capture_id = treetracker.capture.id
          LEFT JOIN treetracker.tag
              on treetracker.capture_tag.tag_id = treetracker.tag.id
          ${
            filter.tokenized
              ? `LEFT JOIN wallet.wallet
                  ON treetracker.grower_account.wallet = wallet.wallet.name
                 LEFT JOIN wallet.token
                  ON wallet.token.wallet_id = wallet.wallet.id
                 `
              : ''
          }
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder))
      .distinct();

    promise = promise.orderBy(
      sort?.order_by || 'treetracker.capture.created_at',
      sort?.order || 'desc',
    );

    const { limit, offset } = options;
    if (limit) {
      promise = promise.limit(limit);
    }
    if (offset) {
      promise = promise.offset(offset);
    }

    const captures = await promise;

    return captures;
  }

  async getCount(filterCriteria: CaptureFilter) {
    const knex = this.session.getDB();
    const { ...filter } = filterCriteria;

    const result = await knex
      .select(
        knex.raw(
          `COUNT(*) AS count
          FROM treetracker.capture
          LEFT JOIN (
              SELECT ct.capture_id, array_agg(t.name) AS tags
              FROM treetracker.capture_tag ct
              JOIN treetracker.tag t ON t.id = ct.tag_id
              GROUP BY ct.capture_id
            ) t ON treetracker.capture.id = t.capture_id
          LEFT JOIN field_data.device_configuration
              ON field_data.device_configuration.id = treetracker.capture.device_configuration_id
          LEFT JOIN treetracker.grower_account
              ON grower_account.id = treetracker.capture.grower_account_id
          LEFT JOIN (
              SELECT ga.id, w.name AS wallet_name, t.id AS token_id
              FROM wallet.wallet w
              JOIN wallet.token t ON t.wallet_id = w.id
              JOIN treetracker.grower_account ga ON ga.wallet = w.name
            ) wt ON treetracker.capture.grower_account_id = wt.id
          LEFT JOIN treetracker.capture_tag
              on treetracker.capture_tag.capture_id = treetracker.capture.id
          LEFT JOIN treetracker.tag
              on treetracker.capture_tag.tag_id = treetracker.tag.id
          ${
            filter.tokenized
              ? `LEFT JOIN wallet.wallet
                  ON treetracker.grower_account.wallet = wallet.wallet.name
                 LEFT JOIN wallet.token
                  ON wallet.token.wallet_id = wallet.wallet.id
                 `
              : ''
          }
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder))
      .distinct();

    return result[0].count;
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
          treetracker.capture.*,
          t.tags,
          field_data.device_configuration.device_identifier,
          field_data.device_configuration.manufacturer AS device_manufacturer,
          field_data.device_configuration.model AS device_model,
          field_data.device_configuration.device AS device_type,
          field_data.device_configuration.os_version AS device_os_version,
          treetracker.grower_account.wallet,
          treetracker.grower_account.reference_id as grower_reference_id,
          regions.region.properties AS region_properties
          FROM treetracker.capture
            LEFT JOIN treetracker.grower_account
              ON grower_account.id = treetracker.capture.grower_account_id
            LEFT JOIN (
              SELECT ct.capture_id, ARRAY_AGG(t.name) AS tags
              FROM treetracker.capture_tag ct
              JOIN treetracker.tag t ON t.id = ct.tag_id
              GROUP BY ct.capture_id
            ) t ON treetracker.capture.id = t.capture_id
            LEFT JOIN field_data.device_configuration
              ON field_data.device_configuration.id = treetracker.capture.device_configuration_id
            LEFT JOIN regions.region
              ON ST_WITHIN(capture.estimated_geometric_location, regions.region.shape)
      `),
      )
      .where('capture.id', id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }
}

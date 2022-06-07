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

    if (filterObject.tag) {
      filterObject[`treetracker.tag.name`] = filterObject.tag;
      delete filterObject.tag;
    }

    if (filterObject.organization_ids) {
      result.where(
        `${this.tableName}.planting_organization_id`,
        'in',
        filterObject.organization_ids.split(','),
      );
      delete filterObject.organization_ids;
    }

    result.where(filterObject);
  }

  async getByFilter(filterCriteria: CaptureFilter, options: FilterOptions) {
    const knex = this.session.getDB();
    const { sort, ...filter } = filterCriteria;

    let promise = knex
      .select(
        knex.raw(
          `
            treetracker.capture.*,
            t.tags,
            field_data.device_configuration.device_identifier,
            treetracker.grower_account.wallet,
            wt.wallet_name,
            wt.token_id
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
          ${
            filter.tag
              ? `INNER JOIN treetracker.tree_tag
                  on treetracker.tree_tag.tree_id = treetracker.capture.id
                 INNER JOIN treetracker.tag
                  on treetracker.tree_tag.tag_id = treetracker.tag.id`
              : ''
          }
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder));

    promise = promise.orderBy(
      sort?.order_by || 'created_at',
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
          `
            COUNT(*) AS count
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
          ${
            filter.tag
              ? `INNER JOIN treetracker.tree_tag
                  on treetracker.tree_tag.tree_id = treetracker.capture.id
                 INNER JOIN treetracker.tag
                  on treetracker.tree_tag.tag_id = treetracker.tag.id`
              : ''
          }
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filter, builder));

    return result[0].count;
  }

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
          treetracker.capture.*,
          field_data.device_configuration.device_identifier,
          field_data.device_configuration.manufacturer AS device_manufacturer,
          field_data.device_configuration.model AS device_model,
          field_data.device_configuration.device AS device_type,
          field_data.device_configuration.os_version AS device_os_version,
          treetracker.grower_account.wallet,
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

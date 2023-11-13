import FilterOptions from 'interfaces/FilterOptions';
import RawCapture from 'interfaces/RawCapture';
import RawCaptureFilter from 'interfaces/RawCaptureFilter';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class RawCaptureRepository extends BaseRepository<RawCapture> {
  constructor(session: Session) {
    super('raw_capture', session);
    this.tableName = 'field_data.raw_capture';
  }

  filterWhereBuilder(object, builder) {
    const result = builder;
    const {
      whereNulls = [],
      whereNotNulls = [],
      whereIns = [],
      ...parameters
    } = object;

    // if (parameters.tokenized === 'true') {
    //   whereNotNulls.push('wallet.token.id');
    // } else if (parameters.tokenized === 'false') {
    //   whereNulls.push('wallet.token.id');
    // }
    // delete parameters.tokenized;

    result.whereNot(`${this.tableName}.status`, 'deleted');
    whereNotNulls.forEach((whereNot) => {
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

    if (filterObject.status) {
      result.where(`${this.tableName}.status`, '=', filterObject.status);
      delete filterObject.status;
    }

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

    // if (filterObject.species_id && filterObject.species_id !== 'null') {
    //   filterObject[`treetracker.capture_tag.tag_id`] = filterObject.species_id;
    //   delete filterObject.species_id;
    // }

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
      result.where(`field_data.session.organization_id`, 'in', [
        ...filterObject.organization_id,
      ]);
      delete filterObject.organization_id;
    }

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

  async getByFilter(filterCriteria: RawCaptureFilter, options: FilterOptions) {
    const knex = this.session.getDB();
    const { sort, ...filter } = filterCriteria;

    let promise = knex(this.tableName)
      .select(
        'field_data.raw_capture.id',
        'field_data.raw_capture.reference_id',
        'field_data.raw_capture.image_url',
        'field_data.raw_capture.lat',
        'field_data.raw_capture.lon',
        'field_data.raw_capture.gps_accuracy',
        'field_data.raw_capture.note',
        'field_data.raw_capture.abs_step_count',
        'field_data.raw_capture.delta_step_count',
        'field_data.raw_capture.rotation_matrix',
        'field_data.raw_capture.session_id',
        'field_data.raw_capture.rejection_reason',
        'field_data.device_configuration.device_identifier',
        'field_data.device_configuration.id as device_configuration_id',
        'field_data.wallet_registration.grower_account_id',
        'field_data.wallet_registration.wallet',
        'field_data.wallet_registration.user_photo_url',
        'field_data.raw_capture.extra_attributes',
        'field_data.raw_capture.status',
        'field_data.raw_capture.created_at',
        'field_data.raw_capture.updated_at',
        'field_data.raw_capture.captured_at',
        'field_data.session.organization_id',
      )
      .leftJoin(
        'field_data.session',
        'field_data.raw_capture.session_id',
        '=',
        'field_data.session.id',
      )
      .leftJoin(
        'field_data.wallet_registration',
        'field_data.session.originating_wallet_registration_id',
        '=',
        'field_data.wallet_registration.id',
      )
      .leftJoin(
        'treetracker.grower_account',
        'field_data.wallet_registration.grower_account_id',
        '=',
        'treetracker.grower_account.id',
      )
      .leftJoin(
        'field_data.device_configuration',
        'field_data.session.device_configuration_id',
        '=',
        'field_data.device_configuration.id',
      )
      .leftJoin(
        'treetracker.capture_tag',
        'field_data.raw_capture.id',
        '=',
        'treetracker.capture_tag.capture_id',
      )
      .orderBy(
        `${this.tableName}.${sort?.order_by || 'created_at'}`,
        sort?.order || 'desc',
      )
      .where((builder) => this.filterWhereBuilder(filter, builder))
      .distinct();

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

  async getCount(filterCriteria: RawCaptureFilter) {
    const knex = this.session.getDB();
    const { ...filter } = filterCriteria;

    const result = await knex(this.tableName)
      .count('*')
      .leftJoin(
        'field_data.session',
        'field_data.raw_capture.session_id',
        '=',
        'field_data.session.id',
      )
      .leftJoin(
        'field_data.wallet_registration',
        'field_data.session.originating_wallet_registration_id',
        '=',
        'field_data.wallet_registration.id',
      )
      .leftJoin(
        'treetracker.grower_account',
        'field_data.wallet_registration.grower_account_id',
        '=',
        'treetracker.grower_account.id',
      )
      .leftJoin(
        'field_data.device_configuration',
        'field_data.session.device_configuration_id',
        '=',
        'field_data.device_configuration.id',
      )
      .leftJoin(
        'treetracker.capture_tag',
        'field_data.raw_capture.id',
        '=',
        'treetracker.capture_tag.capture_id',
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
          ${this.tableName}.*,
          t.tags,
          field_data.device_configuration.device_identifier,
          field_data.device_configuration.manufacturer AS device_manufacturer,
          field_data.device_configuration.model AS device_model,
          field_data.device_configuration.device AS device_type,
          field_data.device_configuration.os_version AS device_os_version,
          wr.wallet,
          wr.user_photo_url,
          wr.grower_account_id,
          ga.reference_id as grower_reference_id,
          re.properties AS region_properties
          FROM ${this.tableName}
            LEFT JOIN treetracker.capture AS c
              ON ${this.tableName}.id = c.id
            LEFT JOIN (
              SELECT ct.capture_id, ARRAY_AGG(t.name) AS tags
              FROM treetracker.capture_tag AS ct
              JOIN treetracker.tag AS t ON t.id = ct.tag_id
              GROUP BY ct.capture_id
            ) AS t ON c.id = t.capture_id
            LEFT JOIN regions.region AS re
              ON ST_WITHIN(c.estimated_geometric_location, re.shape)
            LEFT JOIN field_data.session AS se
              ON ${this.tableName}.session_id = se.id
            LEFT JOIN field_data.device_configuration
              ON field_data.device_configuration.id = se.device_configuration_id
            LEFT JOIN field_data.wallet_registration AS wr
              ON se.originating_wallet_registration_id = wr.id
            LEFT JOIN treetracker.grower_account AS ga
              ON ga.id = wr.grower_account_id
      `),
      )
      .where(`${this.tableName}.id`, id)
      .first();

    if (!object) {
      throw new HttpError(404, `Can not find ${this.tableName} by id:${id}`);
    }
    return object;
  }
}

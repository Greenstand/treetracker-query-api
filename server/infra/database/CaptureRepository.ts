import Capture from 'interfaces/Capture';
import FilterOptions from 'interfaces/FilterOptions';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

type Filter = Partial<{
  date_range: { startDate: string; endDate: string };
  id: string;
  tree_id: string;
  planting_organization_id: string;
  image_url: string;
  lat: string;
  lon: string;
  status: string;
  grower_account_id: string;
  morphology: string;
  age: number;
  note: string;
  attributes: string;
  species_id: string;
  session_id: string;
  tag: string;
  sort: { order: string; order_by: string };
}>;

export default class CaptureRepository extends BaseRepository<Capture> {
  constructor(session: Session) {
    super('capture', session);
    this.tableName = 'treetracker.capture';
  }

  filterWhereBuilder(object, builder) {
    const result = builder;
    const {
      parameters = {},
      whereNulls = [],
      whereNotNulls = [],
      whereIns = [],
    } = {
      ...object,
    };
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

    if (filterObject.captured_at_start_date) {
      result.where(
        `${this.tableName}.captured_at`,
        '>=',
        filterObject.captured_at_start_date,
      );
      delete filterObject.captured_at_start_date;
    }
    if (filterObject.captured_at_end_date) {
      result.where(
        `${this.tableName}.captured_at`,
        '<=',
        filterObject.captured_at_end_date,
      );
      delete filterObject.captured_at_end_date;
    }
    result.where(filterObject);
  }

  async getByFilter(filterCriteria: Filter, options: FilterOptions) {
    const knex = this.session.getDB();

    let promise = knex
      .select(
        knex.raw(
          `
            treetracker.capture.id,
            treetracker.capture.tree_id,
            treetracker.capture.planting_organization_id,
            treetracker.capture.image_url,
            treetracker.capture.lat,
            treetracker.capture.lon,
            treetracker.capture.status,
            treetracker.capture.grower_account_id,
            treetracker.capture.morphology,
            treetracker.capture.age,
            treetracker.capture.note,
            treetracker.capture.attributes,
            treetracker.capture.species_id,
            treetracker.capture.session_id,
            treetracker.capture.created_at,
            treetracker.capture.captured_at,
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
        `,
        ),
      )
      .where((builder) => this.filterWhereBuilder(filterCriteria, builder));

    // let promise = this.session
    //   .getDB()
    //   .select(`treetracker.captures.*`, 't.tag_array')
    //   .leftJoin(
    //     knex
    //       .select(
    //         knex.raw(
    //           'treetracker.capture_tag.capture_id, array_agg(tag.name) as tag_array',
    //         ),
    //       )
    //       .from('treetracker.capture_tag')
    //       .join(
    //         'treetracker.tag',
    //         'tag.id',
    //         '=',
    //         'treetracker.capture_tag.tag_id',
    //       )
    //       .groupBy('treetracker.capture_tag.capture_id')
    //       .as('t'),
    //     `treetracker.captures.id`,
    //     '=',
    //     't.capture_id',
    //   )
    //   .where((builder) => this.filterWhereBuilder(filterCriteria, builder));

    promise = promise.orderBy(
      filterCriteria?.sort?.order_by || 'created_at',
      filterCriteria?.sort?.order || 'desc',
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

  async getById(id: string | number) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
          treetracker.capture.*,
          field_data.device_configuration.*,
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

  // async getByOrganization(organization_id: string, options: FilterOptions) {
  //   const { limit, offset } = options;
  //   const sql = `
  //     SELECT
  //       *
  //     FROM capture
  //     WHERE planting_organization_id = ${organization_id}
  //     LIMIT ${limit}
  //     OFFSET ${offset}
  //   `;
  //   const object = await this.session.getDB().raw(sql);
  //   return object.rows;
  // }

  // async getByDateRange(
  //   date_range: { startDate: string; endDate: string },
  //   options: FilterOptions,
  // ) {
  //   const { limit, offset } = options;
  //   const startDateISO = `${date_range.startDate}T00:00:00.000Z`;
  //   const endDateISO = new Date(
  //     new Date(`${date_range.endDate}T00:00:00.000Z`).getTime() + 86400000,
  //   ).toISOString();
  //   const sql = `
  //     SELECT
  //       *
  //     FROM capture
  //     WHERE time_created >= '${startDateISO}'::timestamp
  //     AND time_created < '${endDateISO}'::timestamp
  //     LIMIT ${limit}
  //     OFFSET ${offset}
  //   `;
  //   const object = await this.session.getDB().raw(sql);
  //   return object.rows;
  // }

  // async getByTag(tag: string, options: FilterOptions) {
  //   const { limit, offset } = options;

  //   const sql = `
  //   SELECT
  //     capture.*
  //   FROM capture
  //   INNER JOIN tree_tag
  //     on tree_tag.tree_id = capture.id
  //   INNER JOIN tag
  //     on tree_tag.tag_id = tag.id
  //   WHERE
  //     tag.tag_name in ('${tag}')
  //   LIMIT ${limit}
  //   OFFSET ${offset}
  //   `;
  //   const object = await this.session.getDB().raw(sql);
  //   return object.rows;
  // }
}

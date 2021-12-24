import Session from 'infra/database/session'
import { Knex } from 'knex'
import HttpError from 'utils/HttpError'

export default class BaseRepository<T> {
  tableName: string
  session: Session

  constructor(tableName: string, session: Session) {
    this.tableName = tableName
    this.session = session
  }

  async getById(id: string | number) : Promise<T> {
    const object = await this.session
      .getDB()
      .select()
      .table(this.tableName)
      .where('id', id)
      .first()
    if (!object) {
      throw new HttpError(404, `Can not found ${this.tableName} by id:${id}`)
    }
    return object
  }

  /*
   * select by filter
   * support: and / or
   * options:
   *  limit: number
   */
  async getByFilter<T>(
    filter: T,
    options: { limit?: number } | undefined = undefined,
  ) {
    const whereBuilder = function (object: any, builder: Knex.QueryBuilder) {
      let result = builder
      if (object.and) {
        expect(Object.keys(object)).toHaveLength(1)
        expect(Array.isArray(object.and)).toBe(true)
        for (const one of object.and) {
          if (one.or) {
            result = result.andWhere((subBuilder) =>
              whereBuilder(one, subBuilder),
            )
          } else {
            expect(Object.keys(one)).toHaveLength(1)
            result = result.andWhere(
              Object.keys(one)[0],
              Object.values(one)[0] as any,
            )
          }
        }
      } else if (object.or) {
        expect(Object.keys(object)).toHaveLength(1)
        expect(Array.isArray(object.or)).toBe(true)
        for (const one of object.or) {
          if (one.and) {
            result = result.orWhere((subBuilder) =>
              whereBuilder(one, subBuilder),
            )
          } else {
            expect(Object.keys(one)).toHaveLength(1)
            result = result.orWhere(
              Object.keys(one)[0],
              Object.values(one)[0] as any,
            )
          }
        }
      } else {
        result.where(object)
      }
      return result
    }

    let promise = this.session
      .getDB()
      .select()
      .table(this.tableName)
      .where((builder) => whereBuilder(filter, builder))
    if (options && options.limit) {
      promise = promise.limit(options && options.limit)
    }
    const result = await promise
    expect(Array.isArray(result)).toBe(true)
    return result
  }

  async countByFilter<T>(filter: T) {
    const result = await this.session
      .getDB()
      .count()
      .table(this.tableName)
      .where(filter)
    return parseInt(result[0].count.toString())
  }

  async update<T>(object: T & { id: string | number }) {
    const result = await this.session
      .getDB()(this.tableName)
      .update(object)
      .where('id', object.id)
      .returning('*')
    return result[0]
  }

  async create<T>(object: T) {
    const result = await this.session
      .getDB()(this.tableName)
      .insert(object)
      .returning('*')
    return result[0]
  }
}

import { Wallets } from 'models/Wallets';
import HttpError from '../../utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class WalletsRepository extends BaseRepository<Wallets> {
  constructor(session: Session) {
    super('wallets', session);
  }

  async getWalletById(id: string) {
    const object = await this.session
      .getDB()
      .select(
        this.session.getDB().raw(`
        id,
        name
        `),
      )
      .table(this.tableName)
      .where('id', id)
      .first();
    if (!object) {
      throw new HttpError(
        404,
        `Can not found ${this.tableName} by id or name:${id}`,
      );
    }
    return object;
  }

  // async getByWallets(wallets_id: string, options: any) {
  //   const { limit, offset } = options;
  //   const sql = `
  //     SELECT
  //       *
  //     FROM entity
  //     LEFT JOIN planter ON planter.organization_id = entity.id
  //     WHERE planter.id = ${wallets_id}
  //     LIMIT ${limit}
  //     OFFSET ${offset}
  //   `;
  //   const object = await this.session.getDB().raw(sql);
  //   return object.rows;
  // }
}

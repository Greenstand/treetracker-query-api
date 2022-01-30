import Wallets from 'interfaces/Wallets';
import BaseRepository from './BaseRepository';
import Session from './Session';
import HttpError from '../../utils/HttpError';

export default class WalletsRepository extends BaseRepository<Wallets> {
  constructor(session: Session) {
    super('wallet.wallet', session);
  }

  async getWalletByIdOrName(walletIdOrName: string) {
    const sql = `
    SELECT *
    FROM
     wallet.wallet
    WHERE
      id = '${walletIdOrName}'
    OR
      name = '${walletIdOrName}'`;

    const object = await this.session.getDB().raw(sql);

    if (!object && object.rows.length !== 1) {
      throw new HttpError(
        404,
        `Can not found ${this.tableName} by id:${walletIdOrName} name:${walletIdOrName}`,
      );
    }
    return object.rows[0];
  }
}

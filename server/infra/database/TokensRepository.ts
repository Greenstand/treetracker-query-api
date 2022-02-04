import Tokens from 'interfaces/Tokens';
import HttpError from 'utils/HttpError';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class TokensRepository extends BaseRepository<Tokens> {
  constructor(session: Session) {
    super('wallet.token', session);
  }

  async getById(tokenId: string) {
    const sql = `
    SELECT *
    FROM
     wallet.token
     WHERE id = '${tokenId}'
`;

    const object = await this.session.getDB().raw(sql);

    if (!object && object.rows.length !== 1) {
      throw new HttpError(
        404,
        `Can not found ${this.tableName} by id:${tokenId}`,
      );
    }
    return object.rows[0];
  }
}

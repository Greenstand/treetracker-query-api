import FilterOptions from 'interfaces/FilterOptions';
import Transaction from 'interfaces/Transaction';
import BaseRepository from './BaseRepository';
import Session from '../infra/database/Session';

export default class TransactionRepository extends BaseRepository<Transaction> {
  constructor(session: Session) {
    super('wallet.transaction', session);
  }

  async getTransactions(
    filter: Partial<{ token_id: string; wallet_id: string }>,
    options: FilterOptions,
  ): Promise<{ transactions: Transaction[]; count: number }> {
    const { token_id, wallet_id } = filter;
    const { limit, offset } = options;
    let sql = `
        SELECT
            t.id,
            t.token_id,
            t.source_wallet_id,
            t.destination_wallet_id,
            srcWallet.name AS source_wallet_name,
            destWallet.name AS destination_wallet_name,
            t.processed_at,
            srcWallet.logo_url AS source_wallet_logo_url
        FROM
            wallet.transaction t
            LEFT JOIN wallet.wallet srcWallet ON srcWallet.id = t.source_wallet_id
            LEFT JOIN wallet.wallet destWallet ON destWallet.id = t.destination_wallet_id
        `;
    if (token_id) {
      sql += `
                WHERE
                    t.token_id = '${token_id}'
            `;
    } else if (wallet_id) {
      sql += `
                WHERE
                    t.source_wallet_id = '${wallet_id}'
                    OR t.destination_wallet_id = '${wallet_id}'
            `;
    }

    const knex = this.session.getDB();
    const count = await knex.select(
      knex.raw(`count(*) from (${sql}) as count`),
    );

    sql += `
            LIMIT ${limit}
            OFFSET ${offset};
        `;
    const object = await knex.raw(sql);
    return { transactions: object.rows, count: +count[0].count };
  }
}

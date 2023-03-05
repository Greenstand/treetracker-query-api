import FilterOptions from 'interfaces/FilterOptions';
import Wallet from 'interfaces/Wallet';
import BaseRepository from './BaseRepository';
import patch, { PATCH_TYPE } from './patch';
import Session from 'infra/database/Session';
import HttpError from 'utils/HttpError';
import { WalletFilter } from 'models/Wallet';

export default class WalletsRepository extends BaseRepository<Wallet> {
  constructor(session: Session) {
    super('wallet.wallet', session);
  }

  async getWalletByIdOrName(walletIdOrName: string) {
    const sql = `
      SELECT 
        wallet.wallet.id,
        wallet.wallet.name,
        wallet.wallet.logo_url,
        wallet.wallet.created_at
      FROM
      wallet.wallet
      WHERE
        id::text = '${walletIdOrName}'
      OR
        name = '${walletIdOrName}'`;

    const object = await this.session.getDB().raw(sql);

    if (!object && object.rows.length !== 1) {
      throw new HttpError(
        404,
        `Can not find ${this.tableName} by id:${walletIdOrName} name:${walletIdOrName}`,
      );
    }
    const objectPatched = await patch(
      object.rows[0],
      PATCH_TYPE.EXTRA_WALLET,
      this.session,
    );
    return objectPatched;
  }

  async getWalletTokenRegionCount(walletIdOrName: string) {
    const sql = `
    select continent.name as continent ,count(continent.name) as token_count
    from wallet.wallet
      left join wallet.token on 
        wallet.token.wallet_id = wallet.wallet.id
      left join public.trees on 
        wallet.token.capture_id::text = public.trees.uuid::text
      left join region as continent on 
        ST_WITHIN(public.trees.estimated_geometric_location, continent.geom)
          and continent.type_id in (select id from region_type where type = 'continents' )
      where wallet.wallet.id::text  = '${walletIdOrName}'
        or wallet.wallet.name = '${walletIdOrName}' 
      group by continent.name
  `;

    const object = await this.session.getDB().raw(sql);

    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_WALLET,
      this.session,
    );
    return objectPatched;
  }

  async getByFilter(filter: WalletFilter, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        wallet.wallet.id,
        wallet.wallet.name,
        wallet.wallet.logo_url,
        wallet.wallet.created_at
      FROM wallet.wallet
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_WALLET,
      this.session,
    );
    return objectPatched;
  }

  async getByName(keyword: string, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      SELECT
        wallet.wallet.id,
        wallet.wallet.name,
        wallet.wallet.logo_url,
        wallet.wallet.created_at
      FROM wallet.wallet
      WHERE name LIKE '%${keyword}%'
      ORDER BY name
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_WALLET,
      this.session,
    );
    return objectPatched;
  }

  async getFeaturedWallet() {
    const sql = `
      SELECT
        wallet.wallet.id as id,
        wallet.wallet.name,
        wallet.wallet.logo_url,
        wallet.wallet.created_at
      FROM wallet.wallet
      join (
      --- convert json array to row
        SELECT json_array_elements(data -> 'wallets') AS wallet_id FROM
        webmap.config WHERE name = 'featured-wallet'
      ) AS t ON
      t.wallet_id::text = concat('"', wallet.id::text, '"')
    `;
    const object = await this.session.getDB().raw(sql);
    const objectPatched = await patch(
      object.rows,
      PATCH_TYPE.EXTRA_WALLET,
      this.session,
    );
    return objectPatched;
  }
}

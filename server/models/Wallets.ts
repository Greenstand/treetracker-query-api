import { delegateRepository } from '../infra/database/delegateRepository';
// eslint-disable-next-line import/no-cycle
import WalletsRepository from '../infra/database/WalletsRepository';

export type Wallet = {
  id: string;
  name: string;
  token_in_wallet: number;
  photo_url: string;
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default {
  getWalletByIdOrName: delegateRepository<WalletsRepository>(
    'getWalletByIdOrName',
  ),
};

import WalletsRepository from '../infra/database/WalletsRepository';
import { delegateRepository } from '../infra/database/delegateRepository';

export type Wallet = {
  id: string;
  name: string;
  token_in_wallet: number;
  photo_url: string;
};

export default {
  getByIdOrName: delegateRepository(WalletsRepository, 'getByIdOrName'),
};

import WalletsRepository from '../infra/database/WalletsRepository';
import log from 'loglevel';
import { delegateRepository } from '../infra/database/delegateRepository';

export type Wallets = {
  id: string;
  name: string;
  token_in_wallet: number;
  photo_url: string;
};

function getWallets(
  walletsRepository: WalletsRepository,
): (filter: any) => Promise<Wallets[]> {
  return async function (filter: any) {
    const wallets = await walletsRepository.getByFilter(filter);
    return wallets;
  };
}

export default {
  getById: delegateRepository(WalletsRepository, 'getById'),
  getWallets,
};

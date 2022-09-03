import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Wallets from 'interfaces/Wallets';
import { delegateRepository } from '../infra/database/delegateRepository';
import WalletsRepository from '../infra/database/WalletsRepository';

type Filter = Partial<{ name: string }>;

function getByFilter(
  WalletRepository: WalletsRepository,
): (filter: Filter, options: FilterOptions) => Promise<Wallets[]> {
  return async function (filter: Filter, options: FilterOptions) {
    if (filter.name) {
      log.warn('using wallet name filter...');
      const wallets = await WalletRepository.getByName(filter.name, options);
      return wallets;
    }
    const wallets = await WalletRepository.getByFilter(filter, options);
    return wallets;
  };
}

export default {
  getWalletByIdOrName: delegateRepository<WalletsRepository, Wallets>(
    'getWalletByIdOrName',
  ),
  getWalletTokenContinentCount: delegateRepository<WalletsRepository, Wallets>(
    'getWalletTokenContinentCount',
  ),
  getByFilter,
  getFeaturedWallet: delegateRepository<WalletsRepository, Wallets>(
    'getFeaturedWallet',
  ),
};

import Wallets from 'interfaces/Wallets';
import { delegateRepository } from '../infra/database/delegateRepository';
import WalletsRepository from '../infra/database/WalletsRepository';

export default {
  getWalletByIdOrName: delegateRepository<WalletsRepository, Wallets>(
    'getWalletByIdOrName',
  ),
  getWalletTokenContinentCount: delegateRepository<WalletsRepository, Wallets>(
    'getWalletTokenContinentCount',
  ),
};

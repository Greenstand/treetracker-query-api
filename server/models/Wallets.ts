import Wallets from 'interfaces/Wallets';
import { delegateRepository } from '../infra/database/delegateRepository';
// eslint-disable-next-line import/no-cycle
import WalletsRepository from '../infra/database/WalletsRepository';

export default {
  getWalletByIdOrName: delegateRepository<WalletsRepository, Wallets>(
    'getWalletByIdOrName',
  ),
};

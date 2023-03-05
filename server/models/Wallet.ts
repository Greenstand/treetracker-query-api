import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Wallet from 'interfaces/Wallet';
import WalletsRepository from 'repositories/WalletsRepository';
import Session from 'infra/database/Session';

export type WalletFilter = Partial<{ name: string }>;

class WalletModel {
  private walletRepository: WalletsRepository;
  constructor(session: Session) {
    this.walletRepository = new WalletsRepository(session);
  }

  async getWallets(
    filter: WalletFilter,
    options: FilterOptions,
  ): Promise<Wallet[]> {
    if (filter.name) {
      log.warn('using wallet name filter...');
      const wallets = await this.walletRepository.getByName(
        filter.name,
        options,
      );
      return wallets;
    }
    const wallets = await this.walletRepository.getByFilter(filter, options);
    return wallets;
  }

  async getWalletsCount(filter: WalletFilter): Promise<number> {
    return this.walletRepository.countByFilter(filter);
  }

  async getWalletsByIdOrName(walletIdOrName: string): Promise<Wallet> {
    return this.walletRepository.getWalletByIdOrName(walletIdOrName);
  }

  async getFeaturedWallets(): Promise<Wallet> {
    return this.walletRepository.getFeaturedWallet();
  }

  async getWalletTokenRegionCount(walletIdOrName: string): Promise<Wallet> {
    return this.walletRepository.getWalletTokenRegionCount(walletIdOrName);
  }
}

export default WalletModel;

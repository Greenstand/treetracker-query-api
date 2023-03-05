import Session from 'infra/database/Session';
import FilterOptions from 'interfaces/FilterOptions';
import WalletModel, { WalletFilter } from 'models/Wallet';

class WalletService {
  private session = new Session();
  private walletModel = new WalletModel(this.session);

  async getWallets(filter: WalletFilter, options: FilterOptions) {
    return this.walletModel.getWallets(filter, options);
  }

  async getWalletsCount(filter: WalletFilter) {
    return this.walletModel.getWalletsCount(filter);
  }

  async getWalletsByIdOrName(walletIdOrName: string) {
    return this.walletModel.getWalletsByIdOrName(walletIdOrName);
  }

  async getFeaturedWallets() {
    return this.walletModel.getFeaturedWallets();
  }

  async getWalletTokenRegionCount(walletIdOrName: string) {
    return this.walletModel.getWalletTokenRegionCount(walletIdOrName);
  }
}

export default WalletService;

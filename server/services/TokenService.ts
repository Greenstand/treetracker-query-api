import Session from 'infra/database/Session';
import FilterOptions from 'interfaces/FilterOptions';
import TokenModel, { TokenFilter } from 'models/Tokens';

export default class TokenService {
  private session = new Session();
  private tokenModel = new TokenModel(this.session);

  async getTokens(filter: TokenFilter, options: FilterOptions) {
    return this.tokenModel.getTokens(filter, options);
  }

  async getTokensCount(filter: TokenFilter) {
    return this.tokenModel.getTokensCount(filter);
  }

  async getTokenById(tokenId: string) {
    return this.tokenModel.getTokenById(tokenId);
  }
}

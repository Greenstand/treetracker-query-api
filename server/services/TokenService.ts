import Session from 'infra/database/Session';
import FilterOptions from 'interfaces/FilterOptions';
import TokenModel, { TokenFilter } from 'models/Tokens';

export default class TokenService {
  private session = new Session();
  private tokenModel = new TokenModel(this.session);

  getTokens(filter: TokenFilter, options: FilterOptions) {
    return this.tokenModel.getTokens(filter, options);
  }

  getTokensCount(filter: TokenFilter) {
    return this.tokenModel.getTokensCount(filter);
  }

  getTokenById(tokenId: string) {
    return this.tokenModel.getTokenById(tokenId);
  }
}

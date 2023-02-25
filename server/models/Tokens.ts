import Session from 'infra/database/Session';
import FilterOptions from 'interfaces/FilterOptions';
import Token from 'interfaces/Token';
import TokensRepository from 'repositories/TokensRepository';

export type TokenFilter = {
  wallet: string;
  withPlanter?: boolean;
  withCapture?: boolean;
};

export default class TokenModel {
  private tokenRepository: TokensRepository;
  constructor(session: Session) {
    this.tokenRepository = new TokensRepository(session);
  }

  async getTokens(
    filter: TokenFilter,
    options: FilterOptions,
  ): Promise<Token[]> {
    const tokens = await this.tokenRepository.getByFilter(filter, options);
    return tokens;
  }

  async getTokensCount(filter: TokenFilter): Promise<number> {
    const total = await this.tokenRepository.getCountByFilter(filter);
    return total;
  }

  async getTokenById(tokenId: string): Promise<Token> {
    const token = await this.tokenRepository.getById(tokenId);
    return token;
  }
}

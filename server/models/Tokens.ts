import FilterOptions from 'interfaces/FilterOptions';
import Tokens from 'interfaces/Tokens';
import { delegateRepository } from '../infra/database/delegateRepository';
import TokensRepository from '../infra/database/TokensRepository';

type Filter = {
  wallet: string;
  withPlanter?: boolean;
  withCapture?: boolean;
};

function getByFilter(
  tokenRepository: TokensRepository,
): (filter: Filter, options: FilterOptions) => Promise<Tokens[]> {
  return async (filter: Filter, options: FilterOptions) => {
    const tokens = await tokenRepository.getByFilter(filter, options);
    return tokens;
  };
}

export default {
  getById: delegateRepository<TokensRepository, Tokens>('getById'),
  getByFilter,
};

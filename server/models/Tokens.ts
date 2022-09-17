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

function getCountByFilter(
  tokenRepository: TokensRepository,
): (filter: Filter) => Promise<number> {
  return async (filter: Filter) => {
    const total = await tokenRepository.getCountByFilter(filter);
    return total;
  };
}

export default {
  getById: delegateRepository<TokensRepository, Tokens>('getById'),
  getByFilter,
  getCountByFilter,
};

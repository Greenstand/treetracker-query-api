import Tokens from 'interfaces/Tokens';
import { delegateRepository } from '../infra/database/delegateRepository';
import TokensRepository from '../infra/database/TokensRepository';

export default {
  getById: delegateRepository<TokensRepository, Tokens>('getById'),
};

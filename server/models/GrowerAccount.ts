import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import GrowerAccount from 'interfaces/GrowerAccount';
import { delegateRepository } from '../infra/database/delegateRepository';
import GrowerAccountRepository from '../infra/database/GrowerAccountRepository';
import GrowerAccountFilter from '../interfaces/GrowerAccountFilter';

function getCount(
  growerAccountRepository: GrowerAccountRepository,
): (filter: GrowerAccountFilter) => Promise<{ count: number }> {
  return async function (filter: GrowerAccountFilter) {
    const count = await growerAccountRepository.getCount(filter);
    return count;
  };
}

function getByFilter(
  growerAccountRepository: GrowerAccountRepository,
): (
  filter: GrowerAccountFilter,
  options: FilterOptions,
) => Promise<GrowerAccount[]> {
  return async function (filter: GrowerAccountFilter, options: FilterOptions) {
    const result = await growerAccountRepository.getByFilter(filter, options);
    return result;
  };
}

function getSelfiesById(
  growerAccountRepository: GrowerAccountRepository,
): (id: string) => Promise<GrowerAccount[]> {
  return async function (id: string) {
    log.warn('using planter name filter...');
    const grower_accounts = await growerAccountRepository.getSelfiesById(id);
    return grower_accounts;
  };
}

function getByName(
  growerAccountRepository: GrowerAccountRepository,
): (keyword: string, options: FilterOptions) => Promise<GrowerAccount[]> {
  return async function (keyword: string, options: FilterOptions) {
    log.warn('using planter name filter...');
    const grower_accounts = await growerAccountRepository.getByName(
      keyword,
      options,
    );
    return grower_accounts;
  };
}

function getGrowerAccountLinks(planter) {
  const links = {
    featured_trees: `/trees?planter_id=${planter.id}&limit=20&offset=0`,
    associated_organizations: `/organizations?planter_id=${planter.id}&limit=20&offset=0`,
    species: `/species?planter_id=${planter.id}&limit=20&offset=0`,
  };
  return links;
}

function getFeaturedGrowers(
  growerAccountRepository: GrowerAccountRepository,
): (options: FilterOptions) => Promise<GrowerAccount[]> {
  return async function (options: FilterOptions) {
    log.warn('using featured planters filter...');
    const grower_accounts =
      await growerAccountRepository.getFeaturedGrowerAccounts(options);
    return grower_accounts;
  };
}

function getWalletsCount(
  growerAccountRepository: GrowerAccountRepository,
): (filter: GrowerAccountFilter) => Promise<{ count: number }> {
  return async (filter: GrowerAccountFilter) => {
    const count = await growerAccountRepository.getWalletsCount(filter);
    return count;
  };
}

function getWalletsByFilter(
  growerAccountRepository: GrowerAccountRepository,
): (
  filter: GrowerAccountFilter,
  options: FilterOptions,
) => Promise<GrowerAccount[]> {
  return async (filter: GrowerAccountFilter, options: FilterOptions) => {
    const result = await growerAccountRepository.getWalletsByFilter(
      filter,
      options,
    );
    return result.map((obj) => obj.wallet);
  };
}

export default {
  getById: delegateRepository<GrowerAccountRepository, GrowerAccount>(
    'getById',
  ),
  getSelfiesById,
  getCount,
  getByFilter,
  getByName,
  getGrowerAccountLinks,
  getFeaturedGrowers,
  getWalletsCount,
  getWalletsByFilter,
};

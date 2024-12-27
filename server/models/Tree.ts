import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import { delegateRepository } from '../infra/database/delegateRepository';
import TreeRepository from '../infra/database/TreeRepository';

type Filter = Partial<{
  organization_id: number;
  date_range: { startDate: string; endDate: string };
  tag: string;
  wallet_id: string;
  geometry: { lat: Array<number>; lon: Array<number> };
}>;

function getByFilter(
  treeRepository: TreeRepository,
): (filter: Filter, options: FilterOptions) => Promise<Tree[]> {
  return async function (filter: Filter, options: FilterOptions) {
    if (filter.organization_id) {
      log.warn('using org filter...');
      const trees = await treeRepository.getByOrganization(
        filter.organization_id,
        options,
      );
      return trees;
    }
    if (filter.date_range) {
      log.warn('using date range filter...');
      const trees = await treeRepository.getByDateRange(
        filter.date_range,
        options,
      );
      return trees;
    }
    if (filter.tag) {
      log.warn('using tag filter...');
      const trees = await treeRepository.getByTag(filter.tag, options);
      return trees;
    }
    if (filter.wallet_id) {
      log.warn('using wallet filter...');
      const trees = await treeRepository.getByWallet(filter.wallet_id, options);
      return trees;
    }
    if (filter.geometry) {
      log.warn('using geometry filter...');
      const trees = await treeRepository.getByGeometry(filter.geometry);
      return trees;
    }

    const trees = await treeRepository.getByFilter(filter, options);
    return trees;
  };
}

function countByFilter(
  treeRepository: TreeRepository,
): (filter: Filter, options: FilterOptions) => Promise<number> {
  return async function (filter: Filter, options: FilterOptions) {
    if (filter.organization_id) {
      log.warn('using org filter...');
      const total = await treeRepository.getByOrganization(
        filter.organization_id,
        options,
        true,
      );
      return total;
    }
    if (filter.date_range) {
      log.warn('using date range filter...');
      const total = await treeRepository.getByDateRange(
        filter.date_range,
        options,
        true,
      );
      return total;
    }
    if (filter.tag) {
      log.warn('using tag filter...');
      const total = await treeRepository.getByTag(filter.tag, options, true);
      return total;
    }
    if (filter.wallet_id) {
      log.warn('using wallet filter...');
      const total = await treeRepository.getByWallet(
        filter.wallet_id,
        options,
        true,
      );
      return total;
    }

    if (filter.geometry) {
      log.warn('using geometry filter...');
      const total = await treeRepository.getByGeometry(filter.geometry, true);
      return total;
    }
    const total = await treeRepository.countByFilter(filter);
    return total;
  };
}

/*
 featured tree, some highlighted tree, for a tempororily solution
 we just put the newest, verified tree
 */
function getFeaturedTreeDepricated(treeRepository: TreeRepository) {
  return async () => {
    // const trees = await treeRepository.getByFilter(
    //  {
    //    approved: true,
    //  },
    //  { limit: 10, orderBy: { column: 'time_created', direction: 'desc' } },
    // );
    //
    const trees: Array<Tree> = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const id of [186737, 186735, 186736, 186734]) {
      // eslint-disable-next-line no-await-in-loop
      const tree = await treeRepository.getById(id);
      trees.push(tree);
    }
    return trees;
  };
}

export default {
  getById: delegateRepository<TreeRepository, Tree>('getById'),
  getByUUID: delegateRepository<TreeRepository, Tree>('getByUUID'),
  getByFilter,
  getFeaturedTree: delegateRepository<TreeRepository, Tree>('getFeaturedTree'),
  countByFilter,
};

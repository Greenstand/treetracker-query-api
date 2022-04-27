import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import { delegateRepository } from '../infra/database/delegateRepository';
import TreeRepository from '../infra/database/TreeRepository';

type Filter = Partial<{
  organization_id: number;
  date_range: { startDate: string; endDate: string };
  tag: string;
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
    const trees = await treeRepository.getByFilter(filter, options);
    return trees;
  };
}

/*
 featured tree, some highlighted tree, for a tempororily solution
 we just put the newest, verified tree
 */
function getFeaturedTree(treeRepository: TreeRepository) {
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
  getByFilter,
  getFeaturedTree,
};

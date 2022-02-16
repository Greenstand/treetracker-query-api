import log from 'loglevel';
import Filter from 'interfaces/Filter';
import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import { delegateRepository } from '../infra/database/delegateRepository';
import TreeRepository from '../infra/database/TreeRepository';

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

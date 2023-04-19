import ContractRepository from 'infra/database/ContractRepository';
import { delegateRepository } from 'infra/database/delegateRepository';
import Contract from 'interfaces/Contract';
import ContractFilter from 'interfaces/ContractFilter';
import FilterOptions from 'interfaces/FilterOptions';

function getByFilter(
  contractRepository: ContractRepository,
): (filter: ContractFilter, options: FilterOptions) => Promise<Contract[]> {
  return async function (filter: ContractFilter, options: FilterOptions) {
    const contracts = await contractRepository.getByFilter(filter, options);
    return contracts;
  };
}

function getCount(
  contractRepository: ContractRepository,
): (filter: ContractFilter) => Promise<Contract[]> {
  return async function (filter: ContractFilter) {
    const count = await contractRepository.getCount(filter);
    return count;
  };
}

export default {
  getByFilter,
  getCount,
  getById: delegateRepository<ContractRepository, Contract>('getById'),
};

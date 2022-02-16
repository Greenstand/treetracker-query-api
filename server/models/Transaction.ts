import TransactionRepository from 'infra/database/TransactionRepository';
import Filter from 'interfaces/Filter';
import FilterOptions from 'interfaces/FilterOptions';
import Transaction from 'interfaces/Transaction';

function getByFilter(
  transactionRepository: TransactionRepository,
): (filter: Filter, options: FilterOptions) => Promise<Transaction[]> {
  return async function (filter: Filter, options: FilterOptions) {
    const transactions = await transactionRepository.getByFilter(
      filter,
      options,
    );
    return transactions;
  };
}

export default {
  getByFilter,
};

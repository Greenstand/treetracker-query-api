import TransactionRepository from 'infra/database/TransactionRepository';
import FilterOptions from 'interfaces/FilterOptions';
import Transaction from 'interfaces/Transaction';

function getByFilter(
  transactionRepository: TransactionRepository,
): (
  filter: Partial<{ token_id: string; wallet_id: string }>,
  options: FilterOptions,
) => Promise<Transaction[]> {
  return async function (
    filter: Partial<{ token_id: string; wallet_id: string }>,
    options: FilterOptions,
  ) {
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

import TransactionRepository from 'repositories/TransactionRepository';
import FilterOptions from 'interfaces/FilterOptions';
import Transaction from 'interfaces/Transaction';
import Session from 'infra/database/Session';

export type TransactionFilter = Partial<{
  token_id: string;
  wallet_id: string;
}>;

export default class TransactionModel {
  private transactionRepository: TransactionRepository;
  constructor(session: Session) {
    this.transactionRepository = new TransactionRepository(session);
  }

  async getTransactions(
    filter: TransactionFilter,
    options: FilterOptions,
  ): Promise<{ transactions: Transaction[]; count: number }> {
    return this.transactionRepository.getTransactions(filter, options);
  }
}

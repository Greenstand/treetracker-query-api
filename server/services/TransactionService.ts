import Session from 'infra/database/Session';
import FilterOptions from 'interfaces/FilterOptions';
import TransactionModel, { TransactionFilter } from 'models/Transaction';

export default class TransactionService {
  private session = new Session();
  private transactionModel = new TransactionModel(this.session);

  async getTransactions(filter: TransactionFilter, options: FilterOptions) {
    return this.transactionModel.getTransactions(filter, options);
  }
}

import { Request, Response, RequestHandler } from 'express';
import FilterOptions from 'interfaces/FilterOptions';
import { TransactionFilter } from 'models/Transaction';
import TransactionService from '../../services/TransactionService';
import { transactionGetQuerySchema } from './schemas';

export const transactionGet: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  await transactionGetQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });
  let { limit = 20, offset = 0 }: FilterOptions = req.query;
  const { token_id, wallet_id }: TransactionFilter = req.query;

  const transactionService = new TransactionService();
  const result = await transactionService.getTransactions(
    { token_id, wallet_id },
    { limit, offset },
  );

  res.send({
    total: result.count,
    offset,
    limit,
    transactions: result.transactions,
  });
  res.end();
};

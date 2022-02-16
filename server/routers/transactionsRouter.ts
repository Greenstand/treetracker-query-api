import express from 'express';
import Joi from 'joi';
import TransactionRepository from 'infra/database/TransactionRepository';
import Filter from 'interfaces/Filter';
import Transaction from 'models/Transaction';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';

const router = express.Router();

router.get(
  '/',
  handlerWrapper(async (req, res) => {
    Joi.assert(
      req.query,
      Joi.object().keys({
        limit: Joi.number().integer().min(-15).max(1000),
        offset: Joi.number().integer().min(0),
        wallet_id: Joi.string().guid(),
        token_id: Joi.string().guid(),
      }),
    );
    let { limit = 20, offset = 0 } = req.query;
    const { token_id, wallet_id } = req.query;
    limit = parseInt(limit);
    offset = parseInt(offset);
    const repo = new TransactionRepository(new Session());
    const filter: Filter = {};
    if (token_id) {
      filter.token_id = token_id;
    } else if (wallet_id) {
      filter.wallet_id = wallet_id;
    }
    const result = await Transaction.getByFilter(repo)(filter, {
      limit,
      offset,
    });

    res.send({
      total: result.length,
      offset,
      limit,
      transactions: result,
    });
    res.end();
  }),
);

export default router;

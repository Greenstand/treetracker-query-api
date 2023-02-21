import Joi from 'joi';

export const transactionGetQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(1000),
  offset: Joi.number().integer().min(0),
  wallet_id: Joi.string().guid(),
  token_id: Joi.string().guid(),
});

import Joi from 'joi';

export const walletQuerySchema = Joi.object({
  name: Joi.string(),
  limit: Joi.number().integer().min(1).max(1000),
  offset: Joi.number().integer().min(0),
});

export const walletIdOrNameSchema = Joi.object({
  wallet_id_or_name: Joi.string().required(),
});

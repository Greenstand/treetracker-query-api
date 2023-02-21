import Joi from 'joi';

export const boundsGetQuerySchema = Joi.object({
  planter_id: Joi.number().integer().min(0),
  organisation_id: Joi.number().integer().min(0),
  wallet_id: Joi.string().uuid(),
}).xor('wallet_id', 'organisation_id', 'planter_id');

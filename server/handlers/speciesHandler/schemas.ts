import Joi from 'joi';

export const speciesIdSchema = Joi.object({
  species_id: Joi.number().required(),
});

export const speciesGetQuerySchema = Joi.object({
  organization_id: Joi.number().integer().min(0),
  planter_id: Joi.number().integer().min(0),
  wallet_id: Joi.string().uuid(),
  limit: Joi.number().integer().min(1).max(1000),
  offset: Joi.number().integer().min(0),
});

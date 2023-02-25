import Joi from 'joi';

export const tokenGetQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(1000),
  offset: Joi.number().integer().min(0),
  wallet: Joi.string().required(),
  withPlanter: Joi.boolean().sensitive(true),
  withCapture: Joi.boolean().sensitive(true),
});

export const tokenIdSchema = Joi.object({
  token_id: Joi.string().guid().required(),
});

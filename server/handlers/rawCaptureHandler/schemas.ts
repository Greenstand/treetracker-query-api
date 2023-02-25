import Joi from 'joi';

export const rawCaptureQetQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(1000),
  offset: Joi.number().integer().min(0),
  status: Joi.string().allow('unprocessed', 'approved', 'rejected'),
  bulk_pack_file_name: Joi.string(),
  grower_account_id: Joi.string().uuid(),
  organization_id: Joi.array().items(Joi.string()),
  startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  id: Joi.string().uuid(),
  reference_id: Joi.number(),
  tree_id: Joi.string().uuid(),
  species_id: Joi.string().uuid(),
  tag_id: Joi.string().uuid(),
  device_identifier: Joi.string(),
  wallet: Joi.string(),
  tokenized: Joi.boolean(),
  sort: Joi.object(),
  token_id: Joi.string().uuid(),
  whereNulls: Joi.array().items(Joi.string()),
  whereNotNulls: Joi.array().items(Joi.string()),
  whereIns: Joi.array().items(
    Joi.object({
      field: Joi.string(),
      values: Joi.array().items(Joi.string()),
    }),
  ),
});

export const rawCaptureIdSchema = Joi.object({
  raw_capture_id: Joi.string().guid().required(),
});

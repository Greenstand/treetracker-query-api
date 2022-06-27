import express from 'express';
import Joi from 'joi';
import RawCaptureRepository from 'infra/database/RawCaptureRepository';
import Session from 'infra/database/Session';
import { handlerWrapper } from './utils';
import RawCaptureModel from '../models/RawCapture';

const router = express.Router();

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().required());
    const repo = new RawCaptureRepository(new Session());
    const exe = RawCaptureModel.getById(repo);
    const result = await exe(req.params.id);
    res.send(result);
    res.end();
  }),
);

router.get(
  '/',
  handlerWrapper(async (req, res) => {
    Joi.assert(
      req.query,
      Joi.object().keys({
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
        status: Joi.string().allow('unprocessed', 'approved', 'rejected'),
        bulk_pack_file_name: Joi.string(),
        grower_account_id: Joi.string().uuid(),
        organization_id: Joi.string(),
        startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        id: Joi.string().uuid(),
        reference_id: Joi.string(),
        tree_id: Joi.string().uuid(),
        species_id: Joi.string().uuid(),
        tag: Joi.string(),
        device_identifier: Joi.string(),
        wallet: Joi.string(),
        tokenized: Joi.string(),
        sort: Joi.object(),
        token_id: Joi.string().uuid(),
      }),
    );
    const {
      limit = 25,
      offset = 0,
      order = 'desc',
      order_by = 'captured_at',
      ...rest
    } = req.query;

    const repo = new RawCaptureRepository(new Session());
    const exe = RawCaptureModel.getByFilter(repo);
    const sort = { order, order_by };
    const result = await exe({ ...rest, sort }, { limit, offset });
    const count = await RawCaptureModel.getCount(repo)({ ...rest });
    res.send({
      raw_captures: result,
      total: Number(count),
      offset,
      limit,
    });
    res.end();
  }),
);

export default router;

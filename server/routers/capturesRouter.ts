import express from 'express';
import Joi from 'joi';
import CaptureRepository from 'infra/database/CaptureRepository';
import Session from 'infra/database/Session';
import { handlerWrapper } from './utils';
import CaptureModel from '../models/Capture';

const router = express.Router();

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().required());
    const repo = new CaptureRepository(new Session());
    const exe = CaptureModel.getById(repo);
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
        grower_account_id: Joi.string().uuid(),
        organization_id: Joi.string(),
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
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
        order_by: Joi.string(),
        order: Joi.string(),
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

    const repo = new CaptureRepository(new Session());
    const exe = CaptureModel.getByFilter(repo);
    const sort = { order, order_by };
    const result = await exe({ ...rest, sort }, { limit, offset });
    const count = await CaptureModel.getCount(repo)({ ...rest });
    res.send({
      captures: result,
      total: Number(count),
      offset,
      limit,
    });
    res.end();
  }),
);

export default router;

import express from 'express';
import Joi from 'joi';
import ContractRepository from 'infra/database/ContractRepository';
import Session from 'infra/database/Session';
import { handlerWrapper, queryFormatter } from './utils';
import ContractModel from '../models/Contract';

const router = express.Router();

router.get(
  '/count',
  handlerWrapper(async (req, res) => {
    const query = queryFormatter(req);

    Joi.assert(
      query,
      Joi.object().keys({
        // contract table filters
        id: Joi.string().uuid(),
        agreement_id: Joi.string().uuid(),
        worker_id: Joi.string().uuid(), // grower_account_id?
        listed: Joi.boolean(),
        // organization_id: Joi.array(),
        startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        // defaults
        limit: Joi.number().integer().min(1).max(20000),
        offset: Joi.number().integer().min(0),
        whereNulls: Joi.array(),
        whereNotNulls: Joi.array(),
        whereIns: Joi.array(),
      }),
    );
    const { ...rest } = req.query;

    const repo = new ContractRepository(new Session());
    const count = await ContractModel.getCount(repo)({ ...rest });
    res.send({
      count: Number(count),
    });
    res.end();
  }),
);

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().required());
    const repo = new ContractRepository(new Session());
    const exe = ContractModel.getById(repo);
    const result = await exe(req.params.id);
    res.send(result);
    res.end();
  }),
);

router.get(
  '/',
  handlerWrapper(async (req, res) => {
    const query = queryFormatter(req);

    Joi.assert(
      query,
      Joi.object().keys({
        // contract table filters
        id: Joi.string().uuid(),
        agreement_id: Joi.string().uuid(),
        worker_id: Joi.string().uuid(), // grower_account_id?
        listed: Joi.boolean(),
        // organization_id: Joi.array(),
        startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        // defaults
        limit: Joi.number().integer().min(1).max(20000),
        offset: Joi.number().integer().min(0),
        whereNulls: Joi.array(),
        whereNotNulls: Joi.array(),
        whereIns: Joi.array(),
      }),
    );
    const {
      limit = 25,
      offset = 0,
      order = 'desc',
      order_by = 'id',
      ...rest
    } = query;

    const repo = new ContractRepository(new Session());
    const exe = ContractModel.getByFilter(repo);
    const sort = { order, order_by };
    const result = await exe({ ...rest, sort }, { limit, offset });
    const count = await ContractModel.getCount(repo)({ ...rest });
    res.send({
      contracts: result,
      total: Number(count),
      offset,
      limit,
    });
    res.end();
  }),
);

export default router;

import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import TreeRepository from '../infra/database/TreeRepository';
import TreeModel from '../models/Tree';

const router = express.Router();

router.get(
  '/featured',
  handlerWrapper(async (req, res) => {
    const repo = new TreeRepository(new Session());
    const exe = TreeModel.getFeaturedTree(repo);
    const result = await exe();
    res.send({
      trees: result,
    });
    res.end();
  }),
);

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.number().required());
    const repo = new TreeRepository(new Session());
    const exe = TreeModel.getById(repo);
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
        planter_id: Joi.number().integer().min(0),
        organization_id: Joi.number().integer().min(0),
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
      }),
    );
    const { limit = 20, offset = 0, planter_id, organization_id } = req.query;
    const repo = new TreeRepository(new Session());
    const filter: any = {};
    if (planter_id) {
      filter.planter_id = planter_id;
    } else if (organization_id) {
      filter.organization_id = organization_id;
    }
    const result = await TreeModel.getByFilter(repo)(filter, {
      limit,
      offset,
    });
    res.send({
      total: null,
      offset,
      limit,
      trees: result,
    });
    res.end();
  }),
);

export default router;

import express from 'express';
import Joi from 'joi';
import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import TreeRepositoryV2 from '../infra/database/TreeRepositoryV2';
import TreeModel from '../models/TreeV2';

const router = express.Router();
type Filter = Partial<{
  planter_id: string;
  organization_id: number;
  date_range: { startDate: string; endDate: string };
  tag: string;
  wallet_id: string;
}>;

router.get(
  '/featured',
  handlerWrapper(async (req, res) => {
    const repo = new TreeRepositoryV2(new Session());
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
    Joi.assert(req.params.id, Joi.string().required());
    const repo = new TreeRepositoryV2(new Session());
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
        planter_id: Joi.string().uuid(),
        organization_id: Joi.number().integer().min(0),
        wallet_id: Joi.string().uuid(),
        tag: Joi.string(),
        limit: Joi.number().integer().min(1).max(1000),
        order_by: Joi.string(),
        desc: Joi.boolean(),
        offset: Joi.number().integer().min(0),
        startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
    const {
      limit = 20,
      offset = 0,
      order_by,
      desc = true,
      organization_id,
      startDate,
      endDate,
      tag,
      wallet_id,
    } = req.query;

    const repo = new TreeRepositoryV2(new Session());
    const filter: Filter = {};
    const options: FilterOptions = {
      limit,
      offset,
      orderBy: {
        column: order_by || 'created_at',
        direction: desc === true ? 'desc' : 'asc',
      },
    };

    if (organization_id) {
      filter.organization_id = organization_id;
    } else if (startDate && endDate) {
      filter.date_range = { startDate, endDate };
    } else if (tag) {
      filter.tag = tag;
    } else if (wallet_id) {
      filter.wallet_id = wallet_id;
    }

    const result = await TreeModel.getByFilter(repo)(filter, options);
    res.send({
      total: await TreeModel.countByFilter(repo)(filter, options),
      offset,
      limit,
      trees: result,
    });
    res.end();
  }),
);

export default router;

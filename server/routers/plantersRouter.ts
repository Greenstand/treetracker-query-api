import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import PlanterRepository from '../infra/database/PlanterRepository';
import Session from '../infra/database/Session';
import PlanterModel from '../models/Planter';

const router = express.Router();
type Filter = Partial<{ planter_id: number; organization_id: number }>;

router.get(
  '/featured',
  handlerWrapper(async (req, res) => {
    const repo = new PlanterRepository(new Session());
    const result = await PlanterModel.getFeaturedPlanters(repo)({ limit: 10 });
    res.send({
      planters: result.map((planter) => ({
        ...planter,
        links: PlanterModel.getPlanterLinks(planter),
      })),
    });
    res.end();
  }),
);

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.number().required());
    const repo = new PlanterRepository(new Session());
    const exe = PlanterModel.getById(repo);
    const result = await exe(req.params.id);
    result.links = PlanterModel.getPlanterLinks(result);
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
        keyword: Joi.string(),
        organization_id: Joi.number().integer().min(0),
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
      }),
    );
    const { limit = 20, offset = 0, organization_id, keyword } = req.query;
    const repo = new PlanterRepository(new Session());
    const filter: Filter = {};
    if (organization_id) {
      filter.organization_id = organization_id;
    }

    if (keyword !== undefined) {
      const result = await PlanterModel.getByName(repo)(keyword, {
        limit,
        offset,
      });
      res.send({
        total: null,
        offset,
        limit,
        planters: result.map((planter) => ({
          ...planter,
          links: PlanterModel.getPlanterLinks(planter),
        })),
      });
      res.end();
    } else {
      const result = await PlanterModel.getByFilter(repo)(filter, {
        limit,
        offset,
      });
      res.send({
        total: null,
        offset,
        limit,
        planters: result.map((planter) => ({
          ...planter,
          links: PlanterModel.getPlanterLinks(planter),
        })),
      });
      res.end();
    }
  }),
);

export default router;

import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import GrowerAccountRepository from '../infra/database/GrowerAccountRepository';
import Session from '../infra/database/Session';
import GrowerAccountModel from '../models/GrowerAccount';

const router = express.Router();
type Filter = Partial<{ planter_id: number; organization_id: number }>;

router.get(
  '/featured',
  handlerWrapper(async (req, res) => {
    const repo = new GrowerAccountRepository(new Session());
    const result = await GrowerAccountModel.getFeaturedPlanters(repo)({
      limit: 10,
    });
    res.send({
      planters: result.map((planter) => ({
        ...planter,
        links: GrowerAccountModel.getGrowerAccountLinks(planter),
      })),
    });
    res.end();
  }),
);

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.number().required());
    const repo = new GrowerAccountRepository(new Session());
    const exe = GrowerAccountModel.getById(repo);
    const result = await exe(req.params.id);
    result.links = GrowerAccountModel.getGrowerAccountLinks(result);
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
        keyword: Joi.string(),
        organization_id: Joi.number().integer().min(0),
        id: Joi.string().uuid(),
        person_id: Joi.string().uuid(),
        device_identifier: Joi.string(),
        first_name: Joi.string(),
        last_name: Joi.string(),
        wallet: Joi.string(),
        email: Joi.string(),
        phone: Joi.string(),
        // id, first_name, last_name,email, person_id, device_id, organization_id, phone, gender, capture count
      }),
    );
    const { limit = 20, offset = 0, organization_id, keyword } = req.query;
    const repo = new GrowerAccountRepository(new Session());
    const filter: Filter = {};
    if (organization_id) {
      filter.organization_id = organization_id;
    }

    if (keyword !== undefined) {
      const result = await GrowerAccountModel.getByName(repo)(keyword, {
        limit,
        offset,
      });
      res.send({
        total: null,
        offset,
        limit,
        planters: result.map((planter) => ({
          ...planter,
          links: GrowerAccountModel.getGrowerAccountLinks(planter),
        })),
      });
      res.end();
    } else {
      const result = await GrowerAccountModel.getByFilter(repo)(filter, {
        limit,
        offset,
      });
      res.send({
        total: null,
        offset,
        limit,
        planters: result.map((planter) => ({
          ...planter,
          links: GrowerAccountModel.getGrowerAccountLinks(planter),
        })),
      });
      res.end();
    }
  }),
);

export default router;

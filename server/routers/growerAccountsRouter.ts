import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import GrowerAccountRepository from '../infra/database/GrowerAccountRepository';
import Session from '../infra/database/Session';
import GrowerAccountFilter from '../interfaces/GrowerAccountFilter';
import GrowerAccountModel from '../models/GrowerAccount';

const router = express.Router();

router.get(
  '/count',
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
      }),
    );
    const { ...rest } = req.query;

    const repo = new GrowerAccountRepository(new Session());
    const { count } = await GrowerAccountModel.getCount(repo)({ ...rest });

    res.send({
      count: Number(count),
    });
    res.end();
  }),
);

router.get(
  '/featured',
  handlerWrapper(async (req, res) => {
    const repo = new GrowerAccountRepository(new Session());
    const result = await GrowerAccountModel.getFeaturedGrowers(repo)({
      limit: 10,
    });
    res.send({
      grower_accounts: result.map((planter) => ({
        ...planter,
        links: GrowerAccountModel.getGrowerAccountLinks(planter),
      })),
    });
    res.end();
  }),
);

router.get(
  '/:id/selfies',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().uuid().required());
    const repo = new GrowerAccountRepository(new Session());
    const exe = GrowerAccountModel.getSelfiesById(repo);
    const result = await exe(req.params.id);
    res.send(result);
    res.end();
  }),
);

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().uuid().required());
    const repo = new GrowerAccountRepository(new Session());
    const exe = GrowerAccountModel.getById(repo);
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
        keyword: Joi.string(),
        organization_id: Joi.string().uuid(),
        id: Joi.string().uuid(),
        person_id: Joi.string().uuid(),
        device_identifier: Joi.string(),
        first_name: Joi.string(),
        last_name: Joi.string(),
        wallet: Joi.string(),
        email: Joi.string(),
        phone: Joi.string(),
      }),
    );
    const { limit = 20, offset = 0, keyword, ...rest } = req.query;

    const repo = new GrowerAccountRepository(new Session());
    const filter: GrowerAccountFilter = { ...rest };

    if (keyword !== undefined) {
      const result = await GrowerAccountModel.getByName(repo)(keyword, {
        limit,
        offset,
      });
      res.send({
        total: null,
        offset,
        limit,
        grower_accounts: result.map((planter) => ({
          ...planter,
        })),
      });
      res.end();
    } else {
      const result = await GrowerAccountModel.getByFilter(repo)(filter, {
        limit,
        offset,
      });
      const { count } = await GrowerAccountModel.getCount(repo)(filter);
      res.send({
        total: Number(count),
        offset,
        limit,
        grower_accounts: result.map((planter) => ({
          ...planter,
        })),
      });
      res.end();
    }
  }),
);

export default router;

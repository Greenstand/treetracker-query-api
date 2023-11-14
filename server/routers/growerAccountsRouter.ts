import express from 'express';
import Joi from 'joi';
import { handlerWrapper, queryFormatter } from './utils';
import GrowerAccountRepository from '../infra/database/GrowerAccountRepository';
import Session from '../infra/database/Session';
import GrowerAccountFilter from '../interfaces/GrowerAccountFilter';
import GrowerAccountModel from '../models/GrowerAccount';

const router = express.Router();

router.get(
  '/count',
  handlerWrapper(async (req, res) => {
    const query = queryFormatter(req);

    // verify filter values
    Joi.assert(
      query,
      Joi.object().keys({
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
        keyword: Joi.string(),
        organization_id: Joi.array().items(Joi.string().uuid()),
        id: Joi.string().uuid(),
        reference_id: Joi.number(),
        person_id: Joi.string().uuid(),
        device_identifier: Joi.string(),
        first_name: Joi.string(),
        last_name: Joi.string(),
        wallet: Joi.string(),
        email: Joi.string(),
        phone: Joi.string(),
        captures_amount_min: Joi.number().integer().min(0),
        captures_amount_max: Joi.number().integer().min(0),
        whereNulls: Joi.array(),
        whereNotNulls: Joi.array(),
        whereIns: Joi.array(),
      }),
    );
    const { ...rest } = query;

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
  '/wallets',
  handlerWrapper(async (req, res) => {
    // verify filter values
    Joi.assert(
      req.params,
      Joi.object().keys({
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
        wallet: Joi.string(),
      }),
    );

    const { limit = 20, offset = 0, ...rest } = req.query;

    const repo = new GrowerAccountRepository(new Session());
    const filter: GrowerAccountFilter = { ...rest };

    const result = await GrowerAccountModel.getWalletsByFilter(repo)(filter, {
      limit,
      offset,
    });

    const { count } = await GrowerAccountModel.getWalletsCount(repo)(filter);

    res.send({
      total: Number(count),
      offset,
      limit,
      wallets: result,
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
    result.links = GrowerAccountModel.getGrowerAccountLinks(result);
    res.send(result);
    res.end();
  }),
);

router.get(
  '/',
  handlerWrapper(async (req, res) => {
    const query = queryFormatter(req);

    // verify filter values
    Joi.assert(
      query,
      Joi.object().keys({
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
        keyword: Joi.string(),
        organization_id: Joi.array().items(Joi.string().uuid()),
        id: Joi.string().uuid(),
        reference_id: Joi.number(),
        person_id: Joi.string().uuid(),
        device_identifier: Joi.string(),
        first_name: Joi.string(),
        last_name: Joi.string(),
        wallet: Joi.string(),
        email: Joi.string(),
        phone: Joi.string(),
        captures_amount_min: Joi.number().integer().min(0),
        captures_amount_max: Joi.number().integer().min(0),
        whereNulls: Joi.array(),
        whereNotNulls: Joi.array(),
        whereIns: Joi.array(),
      }),
    );

    const { limit = 20, offset = 0, keyword, ...rest } = query;

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
          links: GrowerAccountModel.getGrowerAccountLinks(planter),
        })),
      });
      res.end();
    }
  }),
);

export default router;

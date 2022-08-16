import express from 'express';
import Joi from 'joi';
import CountryRepositoryV2 from 'infra/database/CountryRepositoryV2';
import { handlerWrapper } from './utils';
import CountryRepository from '../infra/database/CountryRepository';
import Session from '../infra/database/Session';
import CountryModel from '../models/Country';
import CountryModelV2 from '../models/CountryV2';

const router = express.Router();

router.get(
  '/v2/leaderboard',
  handlerWrapper(async (req, res) => {
    const repo = new CountryRepositoryV2(new Session());
    const exe = CountryModelV2.getLeaderBoard(repo);
    const result = await exe(req.params.id);
    res.send({
      countries: result,
    });
    res.end();
  }),
);

router.get(
  '/v2/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.number().required());
    const repo = new CountryRepositoryV2(new Session());
    const exe = CountryModelV2.getById(repo);
    const result = await exe(req.params.id);
    res.send(result);
    res.end();
  }),
);

router.get(
  '/v2/',
  handlerWrapper(async (req, res) => {
    Joi.assert(
      req.query,
      Joi.object().keys({
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
        lat: Joi.number(),
        lon: Joi.number(),
      }),
    );
    const repo = new CountryRepositoryV2(new Session());
    const result = await CountryModelV2.getByFilter(repo)(req.query);
    res.send({
      countries: result,
    });
    res.end();
  }),
);

router.get(
  '/leaderboard/:region',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.region, Joi.string().required());
    const repo = new CountryRepository(new Session());
    const exe = CountryModel.getLeaderBoard(repo);
    const result = await exe(req.params.region);
    res.send({
      countries: result,
    });
    res.end();
  }),
);

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.number().required());
    const repo = new CountryRepository(new Session());
    const exe = CountryModel.getById(repo);
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
        lat: Joi.number(),
        lon: Joi.number(),
      }),
    );
    const repo = new CountryRepository(new Session());
    const result = await CountryModel.getByFilter(repo)(req.query);
    res.send({
      countries: result,
    });
    res.end();
  }),
);

export default router;

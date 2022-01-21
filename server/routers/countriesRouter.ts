import express from 'express';
import CountryRepository from '../infra/database/CountryRepository';
import { handlerWrapper } from './utils';
import CountryModel, { Country } from '../models/Country';
import Joi from 'joi';
import Session from '../infra/database/Session';

const router = express.Router();

router.get(
  '/leaderboard',
  handlerWrapper(async (req, res, next) => {
    const repo = new CountryRepository(new Session());
    const exe = CountryModel.getLeaderBoard(repo);
    const result = await exe(req.params.id);
    res.send({
      countries: result,
    });
    res.end();
  }),
);

router.get(
  '/:id',
  handlerWrapper(async (req, res, next) => {
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
  handlerWrapper(async (req, res, next) => {
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
    res.send(result);
    res.end();
  }),
);

export default router;

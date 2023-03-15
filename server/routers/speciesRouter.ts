import express from 'express';
import Joi from 'joi';
import log from 'loglevel';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import SpeciesRepository from '../infra/database/SpeciesRepository';
import SpeciesModel from '../models/Species';

const router = express.Router();
type Filter = Partial<{
  planter_id: number;
  organization_id: number;
  wallet_id: string;
}>;

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.number().required());
    const repo = new SpeciesRepository(new Session());
    const exe = SpeciesModel.getById(repo);
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
        organization_id: Joi.number().integer().min(0),
        planter_id: Joi.number().integer().min(0),
        wallet_id: Joi.string(),
        limit: Joi.number().integer().min(1).max(100),
        offset: Joi.number().integer().min(0),
      }),
    );
    const {
      limit = 20,
      offset = 0,
      planter_id,
      organization_id,
      wallet_id,
    } = req.query;
    const repo = new SpeciesRepository(new Session());
    const filter: Filter = {};
    if (organization_id) {
      filter.organization_id = organization_id;
    } else if (planter_id) {
      filter.planter_id = planter_id;
    } else if (wallet_id) {
      filter.wallet_id = wallet_id;
    }
    const begin = Date.now();
    const result = await SpeciesModel.getByFilter(repo)(filter, {
      limit,
      offset,
    });
    log.warn('species filter:', filter, 'took time:', Date.now() - begin, 'ms');
    res.send({
      total: null,
      offset,
      limit,
      species: result,
    });
    res.end();
  }),
);

export default router;

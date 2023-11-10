import express from 'express';
import Joi from 'joi';
import log from 'loglevel';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import SpeciesRepositoryV2 from '../infra/database/SpeciesRepositoryV2';
import SpeciesModel from '../models/SpeciesV2';

const router = express.Router();
type Filter = Partial<{
  planter_id: number;
  organization_id: string;
  wallet_id: string;
  grower_id: string;
}>;

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().uuid().required());
    const repo = new SpeciesRepositoryV2(new Session());
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
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
        keyword: Joi.string(),
        id: Joi.string().uuid(),
        scientific_name: Joi.string(),
        description: Joi.string(),
        morphology: Joi.string(),
        range: Joi.string(),
        created_at: Joi.string(),
        updated_at: Joi.string(),
      }),
    );
    const {
      limit = 20,
      offset = 0,
      planter_id,
      organization_id,
      wallet_id,
      grower_id,
    } = req.query;
    const repo = new SpeciesRepositoryV2(new Session());
    const filter: Filter = {};
    if (organization_id) {
      filter.organization_id = organization_id;
    } else if (planter_id) {
      filter.planter_id = planter_id;
    } else if (wallet_id) {
      filter.wallet_id = wallet_id;
    } else if (grower_id) {
      filter.grower_id = grower_id;
    }
    const begin = Date.now();
    const result = await SpeciesModel.getByFilter(repo)(filter, {
      limit,
      offset,
    });
    log.warn('species filter:', filter, 'took time:', Date.now() - begin, 'ms');
    res.send({
      offset,
      limit,
      species: result,
    });
    res.end();
  }),
);

export default router;

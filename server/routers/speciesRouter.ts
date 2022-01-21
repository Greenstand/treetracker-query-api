import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import SpeciesRepository from '../infra/database/SpeciesRepository';
import SpeciesModel, { Species } from '../models/Species';

const router = express.Router();

router.get(
  '/:id',
  handlerWrapper(async (req, res, next) => {
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
  handlerWrapper(async (req, res, next) => {
    Joi.assert(
      req.query,
      Joi.object().keys({
        organization_id: Joi.number().integer().min(0),
        planter_id: Joi.number().integer().min(0),
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
      }),
    );
    const { limit = 20, offset = 0, planter_id, organization_id } = req.query;
    const repo = new SpeciesRepository(new Session());
    const filter = {};
    if (organization_id) {
      filter.organization_id = organization_id;
    } else if (planter_id) {
      filter.planter_id = planter_id;
    }
    const result = await SpeciesModel.getByFilter(repo)(filter, {
      limit,
      offset,
    });
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

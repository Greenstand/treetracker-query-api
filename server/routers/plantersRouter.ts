import express from 'express';
import { handlerWrapper } from './utils';
import PlanterModel, {Planter} from '../models/Planter';
import Joi from 'joi';
import Session from '../infra/database/Session';
import PlanterRepository from 'infra/database/PlanterRepository';

const router = express.Router();


router.get('/:id', handlerWrapper(async (req, res, next) => {
  Joi.assert(req.params.id, Joi.number().required());
  const repo = new PlanterRepository(new Session());
  const exe = PlanterModel.getById(repo);
  const result = await exe(req.params.id);
  res.send(result);
  res.end();
}));

router.get('/', handlerWrapper(async (req, res, next) => {
  Joi.assert(req.query, Joi.object().keys({
    organization_id: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(1).max(1000),
    offset: Joi.number().integer().min(0),
  }));
  let { limit, offset, planter_id, organization_id } = req.query;
  limit = limit || 20;
  offset = offset || 0;
  const repo = new PlanterRepository(new Session());
  const filter = {};
  if (organization_id) {
    filter['organization_id'] = organization_id;
  }
  const result = await PlanterModel.getByFilter(repo)(
    filter,
    {
      limit,
      offset,
    }
  );
  res.send({
    total: null,
    offset,
    limit,
    trees: result,
  });
  res.end();
}));


export default router;
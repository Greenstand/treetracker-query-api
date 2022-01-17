import express from 'express';
import { handlerWrapper } from './utils';
import OrganizationModel, {Organization} from '../models/Organization';
import Joi from 'joi';
import Session from '../infra/database/Session';
import OrganizationRepository from '../infra/database/OrganizationRepository';

const router = express.Router();


router.get('/:id', handlerWrapper(async (req, res, next) => {
  Joi.assert(req.params.id, Joi.number().required());
  const repo = new OrganizationRepository(new Session());
  const exe = OrganizationModel.getById(repo);
  const result = await exe(req.params.id);
  res.send(result);
  res.end();
}));

router.get('/', handlerWrapper(async (req, res, next) => {
  Joi.assert(req.query, Joi.object().keys({
    planter_id: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(1).max(1000),
    offset: Joi.number().integer().min(0),
  }));
  let { limit, offset, planter_id} = req.query;
  limit = limit || 20;
  offset = offset || 0;
  const repo = new OrganizationRepository(new Session());
  const filter = {};
  if (planter_id) {
    filter['planter_id'] = planter_id;
  }
  const result = await OrganizationModel.getByFilter(repo)(
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
    organizations: result,
  });
  res.end();
}));


export default router;
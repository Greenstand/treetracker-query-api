import express from 'express';
import { handlerWrapper } from './utils';
import TreeModel, {Tree} from '../models/Tree';
import Joi from 'joi';
import Session from 'infra/database/Session';
import TreeRepository from 'infra/database/TreeRepository';

const router = express.Router();

router.get('/:id', handlerWrapper(async (req, res, next) => {
  Joi.assert(req.params.id, Joi.number().required());
  const repo = new TreeRepository(new Session());
  const exe = TreeModel.getById(repo);
  const result = await exe(req.params.id);
  res.send(result);
  res.end();
}));

router.get('/', handlerWrapper(async (req, res, next) => {
  Joi.assert(req.query, Joi.object().keys({
    limit: Joi.number().integer().min(1).max(1000),
    offset: Joi.number().integer().min(0),
  }));
  const {limit, offset} = req.query;
  const repo = new TreeRepository(new Session());
  const result = await TreeModel.getByFilter(repo)({},
    {
      limit: limit || 20,
    }
  );
  res.send({
    total: null,
    offset: offset || 0,
    limit: limit || 20,
    trees: result,
  });
  res.end();
}));


export default router;
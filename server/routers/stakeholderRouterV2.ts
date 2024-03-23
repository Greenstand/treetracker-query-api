import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import StakeholderRepositoryV2 from '../infra/database/StakeholderRepositoryV2';
import StakeholderModel from '../models/StakeholderV2';

const router = express.Router();

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().required());
    const repo = new StakeholderRepositoryV2(new Session());
    const exe = StakeholderModel.getById(repo);
    const result = await exe(req.params.id);
    res.send(result);
    res.end();
  }),
);

export default router;

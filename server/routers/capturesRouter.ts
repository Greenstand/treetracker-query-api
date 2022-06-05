import express from 'express';
import Joi from 'joi';
import CaptureRepository from 'infra/database/CaptureRepository';
import Session from 'infra/database/Session';
import { handlerWrapper } from './utils';
import CaptureModel from '../models/Capture';

const router = express.Router();

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().required());
    const repo = new CaptureRepository(new Session());
    const exe = CaptureModel.getById(repo);
    const result = await exe(req.params.id);
    res.send(result);
    res.end();
  }),
);

router.get(
  '/',
  handlerWrapper(async (req, res) => {
    const repo = new CaptureRepository(new Session());
    const exe = CaptureModel.getByFilter(repo);
    const result = await exe(req.query, {});
    res.send(result);
    res.end();
  }),
);

export default router;

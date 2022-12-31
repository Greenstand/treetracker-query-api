import { Router, Request, Response } from 'express';
import Joi from 'joi';
import BoundsRepository from 'infra/database/BoundsRepository';
import Session from 'infra/database/Session';
import { handlerWrapper } from './utils';
import BoundsModel from '../models/Bounds';

const router = Router();
router.get(
  '/',
  handlerWrapper(async (req: Request, res: Response) => {
    Joi.assert(
      req.query,
      Joi.object().keys({
        planter_id: Joi.number().integer().min(0),
        organisation_id: Joi.number().integer().min(0),
        wallet_id: Joi.number().integer().min(0),
      }),
    );
    const repo = new BoundsRepository(new Session());
    const result = await BoundsModel.getByFilter(repo)(req.query);
    res.send({
      bounds: result,
    });
    res.end();
  }),
);

export default router;

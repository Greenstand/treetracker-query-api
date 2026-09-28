import { Router, Request, Response } from 'express';
import Joi from 'joi';
import BoundsRepository from 'infra/database/BoundsRepository';
import Session from 'infra/database/Session';
import { handlerWrapper } from './utils';
import BoundsModel from '../models/Bounds';

const router = Router();
router.get(
  '/initial',
  handlerWrapper(async (req: Request, res: Response) => {
    Joi.assert(
      req.query,
      Joi.object({
        planter_id: Joi.string(),
        organisation_id: Joi.string(),
        wallet_id: Joi.string(),
      }).xor('planter_id', 'organisation_id', 'wallet_id'),
    );
    const repo = new BoundsRepository(new Session());
    const result = await BoundsModel.getInitialBounds(repo, req.query);
    res.status(200).send({ bounds: result });
  }),
);

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

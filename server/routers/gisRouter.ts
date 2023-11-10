import { Router, Request, Response } from 'express';
import Joi from 'joi';
import BoundsRepository from 'infra/database/BoundsRepository';
import GisRepository from 'infra/database/GisRepository';
import Session from 'infra/database/Session';
import { handlerWrapper } from './utils';
import BoundsModel from '../models/Bounds';
import GisModel from '../models/Gis';

const router = Router();
router.get(
  '/location/nearest',
  handlerWrapper(async (req: Request, res: Response) => {
    Joi.assert(
      req.query,
      Joi.object().keys({
        zoom_level: Joi.number().integer().min(0).required(),
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
        wallet_id: Joi.string().optional(),
        planter_id: Joi.number().integer().optional(),
        organization_id: Joi.number().integer().optional(),
        map_name: Joi.string().optional(),
      }),
    );
    const repo = new GisRepository(new Session());
    const result = await GisModel.getNearest(repo)(req.query);
    res.send({
      nearest: result,
    });
    res.end();
  }),
);

export default router;

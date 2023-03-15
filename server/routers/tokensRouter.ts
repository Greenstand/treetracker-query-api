import express from 'express';
import Joi from 'joi';
import TokensModel from 'models/Tokens';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import TokensRepository from '../infra/database/TokensRepository';

const router = express.Router();

type filter = {
  wallet: string;
  withPlanter?: boolean;
  withCapture?: boolean;
};

router.get(
  '/:tokenId',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.tokenId, Joi.string().required());
    const repo = new TokensRepository(new Session());
    const exe = TokensModel.getById(repo);
    const result = await exe(req.params.tokenId);
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
        limit: Joi.number().integer().min(1).max(100),
        offset: Joi.number().integer().min(0),
        wallet: Joi.string().required(),
        withPlanter: Joi.boolean().sensitive(true),
        withCapture: Joi.boolean().sensitive(true),
      }),
    );

    const {
      limit = 20,
      offset = 0,
      withCapture,
      withPlanter,
      wallet,
    } = req.query;

    const filter: filter = { wallet };
    if (withCapture) filter.withCapture = withCapture === 'true';
    if (withPlanter) filter.withPlanter = withPlanter === 'true';

    const repo = new TokensRepository(new Session());
    const result = await TokensModel.getByFilter(repo)(filter, {
      limit,
      offset,
    });
    res.send({
      total: await TokensModel.getCountByFilter(repo)(filter),
      offset,
      limit,
      tokens: result,
    });
    res.end();
  }),
);

export default router;

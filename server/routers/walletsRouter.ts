import express from 'express';
import Joi from 'joi';
import FilterOptions from 'interfaces/FilterOptions';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import WalletsRepository from '../infra/database/WalletsRepository';
import WalletModel from '../models/Wallets';

const router = express.Router();
type Filter = Partial<{ id: number; name: string }>;

router.get(
  '/featured',
  handlerWrapper(async (req, res) => {
    const repo = new WalletsRepository(new Session());
    const exe = WalletModel.getFeaturedWallet(repo);
    const result = await exe();
    res.send({
      wallets: result,
    });
    res.end();
  }),
);

router.get(
  '/:walletIdOrName/token-region-count',
  handlerWrapper(async (req: express.Request, res: express.Response) => {
    Joi.assert(req.params.walletIdOrName, Joi.string().required());
    const repo = new WalletsRepository(new Session());
    const exe = WalletModel.getWalletTokenContinentCount(repo);
    const result = await exe(req.params.walletIdOrName);
    res.send({
      walletStatistics: result,
    });
    res.end();
  }),
);

router.get(
  '/:walletIdOrName',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.walletIdOrName, Joi.string().required());
    const repo = new WalletsRepository(new Session());
    const exe = WalletModel.getWalletByIdOrName(repo);
    const result = await exe(req.params.walletIdOrName);
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
        name: Joi.string(),
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
      }),
    );
    const { limit = 20, offset = 0, name } = req.query;
    const repo = new WalletsRepository(new Session());
    const filter: Filter = {};
    if (name) {
      filter.name = name;
    }

    const options: FilterOptions = {
      limit,
      offset,
    };

    const result = await WalletModel.getByFilter(repo)(filter, options);
    const count = await WalletModel.getCount(repo)(filter);
    res.send({
      total: Number(count),
      offset,
      limit,
      wallets: result,
    });
    res.end();
  }),
);

export default router;

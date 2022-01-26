import express from 'express';
import { handlerWrapper } from './utils';
import WalletModel from '../models/Wallets';
import Joi from 'joi';
import Session from '../infra/database/Session';
import WalletsRepository from '../infra/database/WalletsRepository';

const router = express.Router();
router.get(
  '/:walletIdOrName',
  handlerWrapper(async (req, res, next) => {
    Joi.assert(req.params.walletIdOrName, Joi.string().required());
    const repo = new WalletsRepository(new Session());
    const exe = WalletModel.getWalletByIdOrName(repo);
    const result = await exe(req.params.walletIdOrName);
    res.send(result);
    res.end();
  }),
);
export default router;

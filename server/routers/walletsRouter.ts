import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import Session from '../infra/database/Session';
import WalletsRepository from '../infra/database/WalletsRepository';
import WalletModel from '../models/Wallets';

const router = express.Router();
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
export default router;

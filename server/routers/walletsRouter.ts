import express from 'express';
import { handlerWrapper } from './utils';
import WalletModel from '../models/Wallets';
import Joi from 'joi';
import Session from '../infra/database/Session';
import WalletsRepository from '../infra/database/WalletsRepository';

const router = express.Router();

router.get(
  '/:id',
  handlerWrapper(async (req, res, next) => {
    const repo = new WalletsRepository(new Session());
    // console.log(repo);
    const exe = WalletModel.getWallets(repo);
    const result = await exe(req.params.id);
    res.send(result);
    res.end();
  }),
);
export default router;

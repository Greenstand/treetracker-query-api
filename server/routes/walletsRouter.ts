import express from 'express';
import {
  walletGet,
  walletGetByIdOrName,
  walletGetFeatured,
  walletGetTokenRegionCount,
} from 'handlers/walletHandler';
import { handlerWrapper } from '../utils/utils';

const router = express.Router();
const routerWrapper = express.Router();

router.get('/featured', handlerWrapper(walletGetFeatured));
router.get(
  '/:wallet_id_or_name/token-region-count',
  handlerWrapper(walletGetTokenRegionCount),
);
router.get('/:wallet_id_or_name', handlerWrapper(walletGetByIdOrName));
router.get('/', handlerWrapper(walletGet));

routerWrapper.use('/wallets', router);
routerWrapper.use('/v2/wallets', router);

export default routerWrapper;

import express from 'express';
import { handlerWrapper } from '../utils/utils';
import { tokenGet, tokenGetById } from 'handlers/tokensHandler';

const router = express.Router();
const routerWrapper = express.Router();

router.get('/', handlerWrapper(tokenGet));
router.get('/:token_id', handlerWrapper(tokenGetById));

routerWrapper.use('/tokens', router);
routerWrapper.use('/v2/tokens', router);

export default routerWrapper;

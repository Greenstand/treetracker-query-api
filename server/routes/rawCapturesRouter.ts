import express from 'express';
import {
  rawCaptureGetCount,
  rawCaptureGetById,
  rawCaptureGet,
} from 'handlers/rawCaptureHandler';
import { handlerWrapper } from '../utils/utils';

const router = express.Router();
const routerWrapper = express.Router();

router.get('/', handlerWrapper(rawCaptureGet));
router.get('/count', handlerWrapper(rawCaptureGetCount));
router.get('/:raw_capture_id', handlerWrapper(rawCaptureGetById));

routerWrapper.use('/raw-captures', router);

export default routerWrapper;

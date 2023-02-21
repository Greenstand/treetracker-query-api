import express from 'express';
import { boundsGet } from 'handlers/boundsHandler';
import { handlerWrapper } from './utils';

const router = express.Router();

router.get('/bounds', handlerWrapper(boundsGet));

export default router;

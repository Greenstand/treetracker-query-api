import express from 'express';
import { transactionGet } from 'handlers/transactionHandler';
import { handlerWrapper } from '../utils/utils';

const router = express.Router();

router.get('/transactions', handlerWrapper(transactionGet));

export default router;

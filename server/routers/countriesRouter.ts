import express from 'express';
import CountryRepository from 'infra/database/CountryRepository';
import { handlerWrapper } from './utils';
import CountryModel, {Country} from '../models/Country';
import Joi from 'joi';

const router = express.Router();

router.get('/:id', handlerWrapper(async (req, res, next) => {
  Joi.assert(req.params.id, Joi.number().required());
  const repo = new CountryRepository();
  const exe = CountryModel.getById(repo);
  const result = await exe(req.params.id);
  res.send(result);
  res.end();
}));


export default router;
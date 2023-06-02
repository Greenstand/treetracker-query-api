import log from 'loglevel';
import FilterOptions from 'interfaces/FilterOptions';
import Tree from 'interfaces/Tree';
import { delegateRepository } from '../infra/database/delegateRepository';
import GisRepository from '../infra/database/GisRepository';

export default {
  getNearest: delegateRepository<GisRepository, unknown>('getNearest'),
};

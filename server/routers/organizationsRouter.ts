import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import OrganizationRepository from '../infra/database/OrganizationRepository';
import Session from '../infra/database/Session';
import OrganizationModel from '../models/Organization';

type Filter = Partial<{ planter_id: number; organization_id: number }>;

const router = express.Router();

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.number().required());
    const repo = new OrganizationRepository(new Session());
    const exe = OrganizationModel.getById(repo);
    const result = await exe(req.params.id);
    result.links = OrganizationModel.getOrganizationLinks(result);
    res.send(result);
    res.end();
  }),
);

router.get(
  '/',
  handlerWrapper(async (req, res) => {
    Joi.assert(
      req.query,
      Joi.object().keys({
        planter_id: Joi.number().integer().min(0),
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
      }),
    );
    const { limit = 20, offset = 0, planter_id } = req.query;
    const repo = new OrganizationRepository(new Session());
    const filter: Filter = {};
    if (planter_id) {
      filter.planter_id = planter_id;
    }
    const result = await OrganizationModel.getByFilter(repo)(filter, {
      limit,
      offset,
    });
    res.send({
      total: null,
      offset,
      limit,
      organizations: result.map((organization) => ({
        ...organization,
        links: OrganizationModel.getOrganizationLinks(organization),
      })),
    });
    res.end();
  }),
);

export default router;

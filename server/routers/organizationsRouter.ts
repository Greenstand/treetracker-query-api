import express from 'express';
import Joi from 'joi';
import { handlerWrapper } from './utils';
import OrganizationRepository from '../infra/database/OrganizationRepository';
import Session from '../infra/database/Session';
import OrganizationModel from '../models/Organization';

type Filter = Partial<{
  planter_id: number;
  organization_id: number;
  ids: Array<number>;
  stakeholder_uuid: string;
}>;

const router = express.Router();

router.get(
  '/featured',
  handlerWrapper(async (req, res) => {
    const repo = new OrganizationRepository(new Session());
    const result = await OrganizationModel.getFeaturedOrganizations(repo)();
    res.send({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      organizations: result.map((org) => ({
        ...org,
        links: OrganizationModel.getOrganizationLinks(org),
      })),
    });
    res.end();
  }),
);

router.get(
  '/:id',
  handlerWrapper(async (req, res) => {
    Joi.assert(req.params.id, Joi.string().required());
    const repo = new OrganizationRepository(new Session());
    let exe;
    if (isNaN(req.params.id)) {
      exe = OrganizationModel.getByMapName(repo);
    } else {
      exe = OrganizationModel.getById(repo);
    }
    const result = await exe(req.params.id);
    result.links = OrganizationModel.getOrganizationLinks(result);
    res.send(result);
    res.end();
  }),
);

router.get(
  '/',
  handlerWrapper(async (req, res) => {
    const query = { ...req.query };
    query.ids = JSON.parse(req.query.ids);
    Joi.assert(
      query,
      Joi.object().keys({
        planter_id: Joi.number().integer().min(0),
        ids: Joi.array().items(Joi.number()),
        stakeholder_uuid: Joi.string().uuid(),
        limit: Joi.number().integer().min(1).max(1000),
        offset: Joi.number().integer().min(0),
      }),
    );
    const {
      limit = 20,
      offset = 0,
      planter_id,
      ids = [],
      stakeholder_uuid,
    } = query;
    const repo = new OrganizationRepository(new Session());
    const filter: Filter = {};
    if (planter_id) {
      filter.planter_id = planter_id;
    }
    if (stakeholder_uuid) {
      filter.stakeholder_uuid = stakeholder_uuid;
    }
    if (ids.length) {
      filter.ids = ids;
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

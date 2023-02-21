import j2s from 'joi-to-swagger';
import { speciesGetQuerySchema } from './schemas';

const { swagger: speciesGetSwagger } = j2s(speciesGetQuerySchema);

const speciesV1Swagger = {
  '/species': {
    get: {
      tags: ['species'],
      summary: 'get species',
      parameters: [
        {
          schema: {
            ...speciesGetSwagger,
          },
          in: 'query',
          name: 'query',
          description: 'Allowed query parameters',
        },
      ],
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  offset: { type: 'number' },
                  limit: { type: 'number' },
                  species: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Species',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/species/{species_id}': {
    get: {
      tags: ['species'],
      summary: 'get a single species',
      parameters: [
        {
          schema: { type: 'string', format: 'uuid' },
          in: 'path',
          required: true,
          name: 'species_id',
          description: 'id of species to return',
        },
      ],
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Species',
              },
            },
          },
        },
      },
    },
  },
};

export const speciesSwagger = {
  ...speciesV1Swagger,
  '/v2/species': {
    get: {
      ...speciesV1Swagger['/species'].get,
      summary:
        'v2 species endpoint, currently the same as /species, yet to be updated',
    },
  },
  '/v2/species/{species_id}': {
    get: {
      ...speciesV1Swagger['/species/{species_id}'].get,
      summary:
        'v2 species endpoint, currently the same as /species/species_id, yet to be updated',
    },
  },
};

export const speciesComponent = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    desc: { type: 'string' },
    active: { type: 'boolean' },
    value_factor: { type: 'number' },
    uuid: { type: 'string', format: 'uuid' },
    total: { type: 'number' },
  },
};

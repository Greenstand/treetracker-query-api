import j2s from 'joi-to-swagger';
import { boundsGetQuerySchema } from './schemas';

const { swagger: boundsGetSwagger } = j2s(boundsGetQuerySchema);

export const boundsSwagger = {
  '/bounds': {
    get: {
      tags: ['bounds'],
      summary: 'get bounds for a planter_id, wallet_id or organisation_id',
      parameters: [
        {
          schema: {
            ...boundsGetSwagger,
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
                  bounds: {
                    $ref: '#/components/schemas/Bounds',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const boundsComponent = {
  type: 'object',
  properties: {
    ne: { type: 'array', minItems: 2, maxItems: 2, items: { type: 'number' } },
    se: { type: 'array', minItems: 2, maxItems: 2, items: { type: 'number' } },
  },
};

import j2s from 'joi-to-swagger';
import { tokenGetQuerySchema } from './schemas';

const { swagger: tokenGetSwagger } = j2s(tokenGetQuerySchema);

export const tokenSwagger = {
  '/tokens': {
    get: {
      tags: ['tokens'],
      summary: 'get tokens',
      parameters: [
        {
          schema: {
            ...tokenGetSwagger,
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
                  tokens: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Token',
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
  '/tokens/{token_id}': {
    get: {
      tags: ['tokens'],
      summary: 'get a single token',
      parameters: [
        {
          schema: { type: 'string', format: 'uuid' },
          in: 'path',
          required: true,
          name: 'token_id',
          description: 'id of token to return',
        },
      ],
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TokenById',
              },
            },
          },
        },
      },
    },
  },
};

export const tokenComponent = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    capture_id: { type: 'string', format: 'uuid' },
    wallet_id: { type: 'string', format: 'uuid' },
    transfer_pending: { type: 'boolean' },
    transfer_pending_id: { type: 'string', format: 'uuid' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    claim: { type: 'boolean' },
  },
};

export const tokenByIdComponent = {
  type: 'object',
  properties: {
    ...tokenComponent.properties,
    tree_id: { type: 'number' },
    tree_image_url: { type: 'string' },
    tree_species_name: { type: 'string' },
  },
};

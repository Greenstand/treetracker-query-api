import j2s from 'joi-to-swagger';
import { walletQuerySchema } from './schemas';

const { swagger: walletGetSwagger } = j2s(walletQuerySchema);

export const walletSwagger = {
  '/wallets': {
    get: {
      tags: ['wallets'],
      summary: 'get wallets',
      parameters: [
        {
          schema: {
            ...walletGetSwagger,
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
                  wallets: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Wallet',
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
  '/wallets/featured': {
    get: {
      tags: ['wallets'],
      summary: 'get wallets featured on the web map',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  wallets: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Wallet',
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
  '/wallets/{wallet_id_or_name}': {
    get: {
      tags: ['wallets'],
      summary: 'get a single wallet by name or id',
      parameters: [
        {
          schema: { type: 'string' },
          in: 'path',
          required: true,
          name: 'wallet_id_or_name',
          description: 'id or name of wallet to return',
        },
      ],
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Wallet',
              },
            },
          },
        },
      },
    },
  },
  '/wallets/{wallet_id_or_name}/token-region-count': {
    get: {
      tags: ['wallets'],
      summary: "get a wallet's regional token distribution",
      parameters: [
        {
          schema: { type: 'string' },
          in: 'path',
          required: true,
          name: 'wallet_id_or_name',
          description: 'id or name of wallet',
        },
      ],
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  walletStatistics: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        continent: { type: 'string' },
                        token_count: { type: 'number' },
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
  },
};

export const walletComponent = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    logo_url: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

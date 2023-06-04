module.exports = {
  extends: [
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier',
  ],

  plugins: [],

  rules: {
    // disabled or modified because too strict
    'no-nested-ternary': 'off',
    'no-restricted-globals': 'warn',
    'no-console': ['warn', { allow: ['info', 'error'] }],
    'import/prefer-default-export': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-promise-executor-return': 'off',
    'consistent-return': 'off',
    radix: 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      { allowShortCircuit: true },
    ],

    // non-default errors
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/await-thenable': 'error',

    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // naming conventions
    camelcase: 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'snake_case'],
      },
    ],

    // allow test files to use dev deps
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.{test,spec}.ts', 'test/**/*'],
      },
    ],

    // import sorting
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // node built in
          'external', // installed dependencies
          'internal', // baseUrl
          'index', // ./
          'sibling', // ./*
          'parent', // ../*
          'object', // ts only
          'type', // ts only
        ],
        pathGroups: [
          {
            pattern: '@test/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'never',
      },
    ],
  },

  env: {
    es2021: true,
    node: true,
    jest: true,
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },

  // report unused eslint-disable comments
  reportUnusedDisableDirectives: true,

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
        moduleDirectory: ['server/'],
      },
    },
  },
};

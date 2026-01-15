module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['**/__tests__/**/*', 'jest.setup.js', 'jest.config.js'],
      env: {
        jest: true,
        node: true,
      },
    },
  ],
  rules: {
    // Keep this as an error: it can cause real runtime bugs
    'react-hooks/rules-of-hooks': 'error',

    // These are valuable, but currently too noisy across the repo.
    // Downgrade to warnings so `npm run lint` can be used in CI/release.
    'react-hooks/exhaustive-deps': 'warn',

    // Allow intentional unused vars (prefix with _), especially in callbacks/catches.
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
  },
};

module.exports = {
  env: {
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'no-relative-import-paths',
    'prettier',
    'sort-keys-fix',
  ],
  reportUnusedDisableDirectives: true,
  root: true,
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-relative-import-paths/no-relative-import-paths': [
      'error',
      { allowSameFolder: false, prefix: '', rootDir: '' },
    ],
    'prettier/prettier': ['error'],
    'sort-keys-fix/sort-keys-fix': ['error'],
  },
};

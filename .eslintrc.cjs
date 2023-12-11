module.exports = {
  extends: ['./.eslint-config.cjs'],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['^@educandu/*', '^@benewagner/*'] }]
  }
};

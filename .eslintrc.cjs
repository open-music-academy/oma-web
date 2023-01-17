module.exports = {
  extends: ['@educandu/eslint-config'],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['^@educandu/*'] }]
  }
};

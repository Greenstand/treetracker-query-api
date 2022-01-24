module.exports = {
  // keep package json sorted
  'package.json': 'sort-package-json',

  // fomat all files recognized by prettier
  '*': 'prettier --ignore-unknown --write',

  // lint and test typescript files after prettier
  '*.ts': ['eslint --fix --cache'],

  // lint entire project if eslint settings changed
  // do not pass file name arguments
  '.eslint*': () => 'eslint . --fix --cache',
};

module.exports = {
  '*': ['prettier --ignore-unknown --write'],
  '*.{ts}': ['eslint --fix --cache'], // run eslint last to prevent prettier from causing lint errors
  '.eslint*': ['eslint . --fix --cache'], // lint entire project if eslint settings changed
}

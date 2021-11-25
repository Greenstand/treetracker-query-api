/*
 * seed data to DB for testing
 */
const pool = require('../server/database/database.js');
const uuid = require('uuid');
const log = require('loglevel');
const assert = require('assert');
const knex = require('knex')({
  client: 'pg',
//  debug: true,
  connection: require('../config/config').connectionString,
});


// Example of a database seed using knex
// This follows from the wallet microservice 
// New mircroservices will need their own seed story

const capture = {
  id: 999999,
};

const captureB = {
  id: 999998,
};

const token = {
  id: 9,
  uuid: uuid.v4(),
};


const wallet = {
  id: 12,
  name: 'wallet',
  password: 'test1234',
  passwordHash: '31dd4fe716e1a908f0e9612c1a0e92bfdd9f66e75ae12244b4ee8309d5b869d435182f5848b67177aa17a05f9306e23c10ba41675933e2cb20c66f1b009570c1',
  salt: 'TnDe2LDPS7VaPD9GQWL3fhG4jk194nde',
  type: 'p',
};


const storyOfThisSeed = `
    a capture: #${capture.id}

    a token: #${token.id}
      capture: #${capture.id}
      wallet: #${wallet.id}
      uuid: ${token.uuid}

    wallet #${wallet.id} connected to capture #${capture.id}, get a token #${token.id}

    Another capture: #${captureB.id}


`;
console.debug(
'--------------------------story of database ----------------------------------',
storyOfThisSeed,
'-----------------------------------------------------------------------------',
);

async function seed() {
  log.debug('seed api key');

  // wallet
  await knex('wallet')
    .insert({
      id: wallet.id,
      type: wallet.type,
      name: wallet.name,
      password: wallet.passwordHash,
      salt: wallet.salt,
    });


  // token
  log.log('seed token');
  await knex('token')
    .insert({
      id: token.id,
      capture_id: capture.id,
      entity_id: wallet.id,
      uuid: token.uuid,
    });

  await knex('token')
    .insert(tokenB);
}

async function clear() {
  log.debug('clear tables');
  await knex('token').del();
  await knex('wallet').del();
}

module.exports = {
  seed, 
  clear, 
  wallet, 
  token
};

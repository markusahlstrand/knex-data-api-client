const postgres = require('./src/postgres');
const mysql = require('./src/mysql');
const knex = require('knex');

module.exports = {
  postgres,
  mysql,
  knex,
};

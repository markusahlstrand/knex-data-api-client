const PostgresClient = require('knex/lib/dialects/postgres');
const dataApi = require('./data-api');
const constants = require('./constants');

// Call postgres client to setup knex, this set as this function
const client = PostgresClient.constructor
  ? class PostgresClientRDSDataAPI extends PostgresClient {}
  : function PostgresClientRDSDataAPI(config) {
      PostgresClientRDSDataAPI.call(this, config);
    };

dataApi(client, PostgresClient, constants.dialects.postgres);

module.exports = client;

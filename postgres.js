const PostgresClient = require("knex/lib/dialects/postgres");
const dataApi = require("./data-api");
const constants = require("./constants");

// Call mysql client to setup knex, this set as this function
function PostgresClientRDSDataAPI(config) {
  PostgresClient.call(this, config);
}

dataApi(PostgresClientRDSDataAPI, PostgresClient, constants.dialects.postgres);

module.exports = PostgresClientRDSDataAPI;

const PostgresClient = require("knex/lib/dialects/postgres");
const dataApi = require("./data-api");

// Call mysql client to setup knex, this set as this function
function PostgresClientRDSDataAPI(config) {
  PostgresClient.call(this, config);
}

dataApi(PostgresClientRDSDataAPI, PostgresClient);

module.exports = PostgresClientRDSDataAPI;

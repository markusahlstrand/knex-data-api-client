const MySqlClient = require("knex/lib/dialects/mysql");
const dataApi = require("./data-api");

// Call mysql client to setup knex, this set as this function
function MysqlClientRDSDataAPI(config) {
  MySqlClient.call(this, config);
}

dataApi(MysqlClientRDSDataAPI, MySqlClient);

module.exports = MysqlClientRDSDataAPI;

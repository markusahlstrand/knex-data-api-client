const MySqlClient = require('knex/lib/dialects/mysql');
const dataApi = require('./data-api');
const constants = require('./constants');

// Call mysql client to setup knex, this set as this function
function MysqlClientRDSDataAPI(config) {
  MySqlClient.call(this, config);
}

dataApi(MysqlClientRDSDataAPI, MySqlClient, constants.dialects.mysql);

module.exports = MysqlClientRDSDataAPI;

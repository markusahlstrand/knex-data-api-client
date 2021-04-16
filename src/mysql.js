const MySqlClient = require('knex/lib/dialects/mysql');
const dataApi = require('./data-api');
const constants = require('./constants');

// Call mysql client to setup knex, this set as this function
const client = MySqlClient.constructor
  ? class MysqlClientRDSDataAPI extends MySqlClient {}
  : function MysqlClientRDSDataAPI(config) {
      MySqlClient.call(this, config);
    };

dataApi(client, MySqlClient, constants.dialects.mysql);

module.exports = client;

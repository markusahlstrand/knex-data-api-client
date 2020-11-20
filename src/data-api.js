/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-undef */

const dataApiClient = require('data-api-client');
const util = require('util');
const Bluebird = require('bluebird');

const DataAPITransaction = require('./data-api-transaction');
const sqlstring = require('./sqlstring');

// Call mysql client to setup knex, this set as this function
function dataAPI(ClientRDSDataAPI, Client, dialect) {
  // Object.setPrototypeOf(ClientRDSDataAPI.prototype, Client.prototype);
  util.inherits(ClientRDSDataAPI, Client);

  // Add/change prototype functions and properties
  Object.assign(ClientRDSDataAPI.prototype, {
    driverName: 'rds-data',

    _driver() {
      // Setup dataApiClient
      return dataApiClient(this.config.connection);
    },

    transaction(...args) {
      return new DataAPITransaction(this, ...args);
    },

    acquireConnection() {
      const connection = this._driver(this.connectionSettings);
      // return Bluebird.resolve(connection);
      return Promise.resolve(connection);
    },

    // Destroy - no connection pool to tear down, so just resolve
    destroy() {
      // return Bluebird.resolve();
      return Promise.resolve();
    },

    // Runs the query on the specified connection, providing the bindings
    // and any other necessary prep work.
    _query(connection, obj) {
      if (!obj || typeof obj === 'string') obj = { sql: obj };

      return new Bluebird((resolve, reject) => {
        if (!obj.sql) {
          resolve();
          return;
        }

        const query = {
          sql: sqlstring.format(obj.sql, obj.bindings, dialect), // Remove bidings as Data API doesn't support them
          continueAfterTimeout: true,
        };

        // If nestTables is set as true, get result metadata (for table names)
        if (obj.options && obj.options.nestTables) {
          query.includeResultMetadata = true;
        }

        // If in a transaction, add this in
        if (connection.__knexTxId) {
          query.transactionId = connection.__knexTxId;
        }

        connection
          .query(query)
          .then((response) => {
            response.rows = response.records;
            obj.response = response;
            resolve(obj);
          })
          .catch((err) => {
            if (
              err.message.startsWith('Database error code: 1064') ||
              err.message.startsWith('Database error code: 1146')
            ) {
              err.code = 'ER_NO_SUCH_TABLE';
            }
            reject(err);
          });
      });
    },

    // Process the response as returned from the query, and format like the standard mysql engine
    processResponse(obj, runner) {
      if (!obj) {
        return null;
      }

      const rows = obj.response.records;
      const fields = rows && rows[0] ? Object.keys(rows[0]) : [];

      // eslint-disable-next-line consistent-return
      if (obj.output) {
        console.log('got here');
        return obj.output.call(runner, obj.response, fields);
      }

      // Format insert
      if (obj.method === 'insert') {
        if (dialect === 'mysql') {
          obj.response = [obj.response.insertId];
          // The data-api client is returning single fields in an object
        } else if (obj.returning && !Array.isArray(obj.returning) && obj.returning !== '*') {
          obj.response = obj.response.records.map((record) => record[obj.returning]);
        } else {
          obj.response = obj.response.records;
        }
      }

      // Format select
      if (obj.method === 'select') {
        // If no nested tables
        if (!obj.options || !obj.options.nestTables) {
          obj.response = obj.response.records;
        }
        // Else if nested tables
        else {
          const res = [];
          const { records, columnMetadata } = obj.response;

          // Iterate through the data
          for (let i = 0; i < columnMetadata.length; i++) {
            const { tableName } = columnMetadata[i];
            const { label } = columnMetadata[i];

            // Iterate through responses
            for (let j = 0; j < records.length; j++) {
              if (!res[j]) res[j] = {};
              if (!res[j][tableName]) res[j][tableName] = {};
              res[j][tableName][label] = records[j][label];
            }
          }
          obj.response = res;
        }
      }

      // Format delete
      if (obj.method === 'del' || obj.method === 'update') {
        obj.response = obj.response.numberOfRecordsUpdated;
      }

      // Format pluck
      if (obj.method === 'pluck') {
        obj.response = obj.response.records;
      }

      // eslint-disable-next-line consistent-return
      return obj.response;
    },
  });
}

module.exports = dataAPI;

const Bluebird = require("bluebird");
const Client = require("knex/lib/dialects/mysql");
const Transaction = require("knex/lib/transaction");
const sqlstring = require("sqlstring");
const dataApiClient = require("data-api-client");

// Handle transactions
class RDSDataAPITransaction extends Transaction {
  commit(conn, value) {
    this._completed = true;
    return conn
      .commitTransaction({
        transactionId: conn.__knexTxId
      })
      .then(res => {
        if (res.transactionStatus === "Transaction Commmitted") {
          return this._resolver(value);
        }
      });
  }

  rollback(conn, err) {
    const self = this;
    this._completed = true;

    return conn
      .rollbackTransaction({
        transactionId: conn.__knexTxId
      })
      .then(status => {
        if (typeof err === "undefined") {
          if (self.doNotRejectOnRollback) {
            self._resolver();
            return;
          }
          err = new Error(`Transaction rejected with non-error: ${err}`);
          self._rejecter(err);
          return;
        }

        if (status.transactionStatus === "Rollback Complete") {
          self._rejecter(err);
          return;
        }
        err = new Error(status.transactionStatus);
        self._rejecter(err);
      });
  }

  acquireConnection() {
    const self = this;
    const connectionSettings = {
      secretArn: self.client.connectionSettings.secretArn,
      resourceArn: self.client.connectionSettings.resourceArn,
      database: self.client.connectionSettings.database
    };
    return new Promise((resolve, reject) => {
      self.client
        .acquireConnection()
        .then(cnx => {
          cnx.beginTransaction(connectionSettings).then(result => {
            cnx.__knexTxId = result.transactionId;
            cnx.isTransaction = true;
            resolve(cnx);
          });
          resolve(cnx);
        })
        .catch(reject);
    });
  }
}

// Call mysql client to setup knex, this set as this function
function ClientRDSDataAPI(config) {
  Client.call(this, config);
}

// Set the prototype of the new driver as Client from knex
Object.setPrototypeOf(ClientRDSDataAPI.prototype, Client.prototype);

// Add/change prototype functions and properties
Object.assign(ClientRDSDataAPI.prototype, {
  driverName: "rds-data",

  _driver() {
    // Setup dataApiClient
    return dataApiClient({
      secretArn: this.config.connection.secretArn,
      resourceArn: this.config.connection.resourceArn,
      database: this.config.connection.database,
      region: this.config.connection.region
    });
  },

  transaction() {
    return new RDSDataAPITransaction(this, ...arguments);
  },

  acquireConnection() {
    const connection = this._driver(this.connectionSettings);
    return Bluebird.resolve(connection);
  },

  // Destroy - no connection pool to tear down, so just resolve
  destroy() {
    return Bluebird.resolve();
  },

  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  _query(connection, obj) {
    if (!obj || typeof obj === "string") obj = { sql: obj };

    return new Bluebird((resolve, reject) => {
      if (!obj.sql) {
        resolve();
        return;
      }

      // If nestTables is set as true, get result metadata (for table names)
      let includeResultMetadata = false;
      if (obj.options && obj.options.nestTables) {
        includeResultMetadata = true;
      }

      connection
        .query({
          sql: sqlstring.format(obj.sql, obj.bindings),
          includeResultMetadata,
          continueAfterTimeout: true
        })
        .then(response => {
          obj.response = response;
          resolve(obj);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  // Process the response as returned from the query, and format like the standard mysql engine
  processResponse(obj) {
    // Format insert
    if (obj.method === "insert") {
      obj.response = [obj.response.insertId];
    }

    // Format select
    if (obj.method === "select") {
      // If no nested tables
      if (!obj.options || !obj.options.nestTables) {
        obj.response = obj.response.records;
      }
      // Else if nested tables
      else {
        let res = [];
        const metadata = obj.response.columnMetadata;
        const records = obj.response.records;

        // Iterate through the data
        for (let i = 0; i < metadata.length; i++) {
          const tableName = metadata[i].tableName;
          const label = metadata[i].label;

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
    if (obj.method === "del") {
      obj.response = obj.response.numberOfRecordsUpdated;
    }

    return obj.response;
  }
});

module.exports = ClientRDSDataAPI;

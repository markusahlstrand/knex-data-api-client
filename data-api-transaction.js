const Transaction = require("knex/lib/transaction");
const Bluebird = require("bluebird");

module.exports = class DataAPITransaction extends Transaction {
  commit(conn, value) {
    this._completed = true;
    return new Bluebird((resolve, reject) => {
      conn
        .commitTransaction({
          transactionId: conn.__knexTxId
        })
        .then(r => {
          resolve(r);
        })
        .catch(e => {
          reject(e);
        });
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

  async acquireConnection() {
    const connectionSettings = {
      secretArn: self.client.connectionSettings.secretArn,
      resourceArn: self.client.connectionSettings.resourceArn,
      database: self.client.connectionSettings.database
    };
    return new Bluebird((resolve, reject) => {
      self.client
        .acquireConnection()
        .then(cnx => {
          cnx
            .beginTransaction(connectionSettings)
            .then(result => {
              cnx.__knexTxId = result.transactionId;
              cnx.isTransaction = true;
              cnx.rdsTransactionId = result.transactionId;
              resolve(cnx);
            })
            .catch(e => {
              reject(e);
            });
        })
        .catch(e => {
          reject(e);
        });
    });
  }
};

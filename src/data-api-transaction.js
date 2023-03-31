/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */

const { timeout, KnexTimeoutError } = require('knex/lib/util/timeout');
const Transaction = require('knex/lib/execution/transaction');

module.exports = class DataAPITransaction extends Transaction {
  // eslint-disable-next-line class-methods-use-this
  begin(connection) {
    return connection.beginTransaction().then((result) => {
      connection.__knexTxId = result.transactionId;
      connection.isTransaction = true;
      connection.rdsTransactionId = result.transactionId;

      return connection;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async commit(connection, value) {
    if (connection.isTransaction && connection.rdsTransactionId) {
      this._completed = true;
      try {
        await connection.commitTransaction({transactionId: connection.rdsTransactionId }).then(() => {
          connection.__knexTxId = null;
          connection.isTransaction = false;
          connection.rdsTransactionId = null;
        });

        this._resolver(value);
      } catch (err) {
        this._rejecter(err);
      }
      
      return;
    }

    this._resolver(value);
  }

  // eslint-disable-next-line class-methods-use-this
  async rollback(connection, err) {
    this._completed = true;
    if (connection.isTransaction && connection.rdsTransactionId) {
      return timeout(new Promise((resolve, reject) => {
        try {
          connection.rollbackTransaction({transactionId: connection.rdsTransactionId }).then(() => {
            connection.__knexTxId = null;
            connection.isTransaction = false;
            connection.rdsTransactionId = null;
          });
  
          resolve();
        } catch (err) {
          reject(err);
        }
      }), 5000)
      .catch((e) => {
        if (!(e instanceof KnexTimeoutError)) {
          return Promise.reject(e);
        }
        this._rejecter(e);
      })
      .then(() => {
        if (err === undefined) {
          if (this.doNotRejectOnRollback) {
            this._resolver();
            return;
          }
          err = new Error(`Transaction rejected with non-error: ${err}`);
        }
        this._rejecter(err);
      })      
    }
  }
};

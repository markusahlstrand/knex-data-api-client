/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */

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
  async rollback(connection) {
    if (connection.isTransaction && connection.rdsTransactionId) {
      this._completed = true;
      try {
        await connection.rollbackTransaction({transactionId: connection.rdsTransactionId }).then(() => {
          connection.__knexTxId = null;
          connection.isTransaction = false;
          connection.rdsTransactionId = null;
        });

        this._resolver();
      } catch (err) {
        this._rejecter(err);
      }
      
      return;
    }

    return;
  }
};

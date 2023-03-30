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
  commit(connection) {
    if (connection.isTransaction && connection.rdsTransactionId) {
      return connection.commitTransaction({transactionId: connection.rdsTransactionId }).then(() => {
        connection.__knexTxId = null;
        connection.isTransaction = false;
        connection.rdsTransactionId = null;

        return connection;
      });
    }

    return connection;
  }

  // eslint-disable-next-line class-methods-use-this
  rollback(connection) {
    if (connection.isTransaction && connection.rdsTransactionId) {
      return connection.rollbackTransaction({transactionId: connection.rdsTransactionId }).then(() => {
        connection.__knexTxId = null;
        connection.isTransaction = false;
        connection.rdsTransactionId = null;

        return connection;
      });
    } 

    return connection;
  }
};

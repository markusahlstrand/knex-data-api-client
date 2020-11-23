const AWS = require('aws-sdk');
AWS.config.update({
  credentials: new AWS.SharedIniFileCredentials({ profile: 'sts' }),
});

require('dotenv').config();

const knexDataApiClient = require('../../../index');

module.exports = {
  client: knexDataApiClient.postgres,
  connection: {
    secretArn: process.env.DB_SECRET_ARN,
    resourceArn: process.env.POSTGRES_DB_CLUSTER_ARN,
    database: process.env.DB_NAME,
    region: process.env.DB_REGION,
  },
};

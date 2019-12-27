#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { RdsStack } = require('../lib/rds-stack');

const app = new cdk.App();
const options = {
  env: {
    region: 'eu-west-1',
  },
};

new RdsStack(app, 'KnexIntegrationTestStack', options);

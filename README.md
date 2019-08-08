# knex-data-api-client

Knex RDS Data API Client

[![npm](https://img.shields.io/npm/v/knex-data-api-client.svg)](https://www.npmjs.com/package/knex-data-api-client)
[![npm](https://img.shields.io/npm/l/knex-data-api-client.svg)](https://www.npmjs.com/package/knex-data-api-client)

The **Knex Data API Client** is a Knex extension that supports the RDS Data API.

Support for transactions, and nestTables is included.

## Use

```javascript
const knexDataApiClient = require("knex-data-api-client");
const knex = require("knex")({
  client: knexDataApiClient,
  connection: {
    secretArn: "secret-arn", // Required
    resourceArn: "db-resource-arn", // Required
    database: "db-name",
    region: "eu-west-2"
  }
});
```

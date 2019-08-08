# knex-data-api-client

Knex RDS Data API Client

[![npm](https://img.shields.io/npm/v/knex-data-api-client.svg)](https://www.npmjs.com/package/knex-data-api-client)
[![npm](https://img.shields.io/npm/l/knex-data-api-client.svg)](https://www.npmjs.com/package/knex-data-api-client)

The **Knex Data API Client** is a Knex extension that supports the RDS Data API.

Support for transactions, and nestTables is included.

## Use

```javascript
const knexDataApiClient = require("knex-data-api-client");
const knexForConfig = require("knex");

/**
 * Knex setup with RDS Data API
 */
var knex = knexForConfig({
  client: knexDataApiClient,
  connection: {
    secretArn: process.env.DB_SECRET_ARN,
    resourceArn: process.env.DB_RESOURCE_ARN,
    database: process.env.DB_NAME,
    region: process.env.REGION,
    dateStrings: ["DATE", "DATETIME"]
  }
});
```

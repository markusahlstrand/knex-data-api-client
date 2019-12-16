# knex-aurora-data-api-client

Knex Aurora Data API Client

[![npm](https://img.shields.io/npm/v/knex-aurora-data-api-client.svg)](https://www.npmjs.com/package/knex-aurora-data-api-client)
[![npm](https://img.shields.io/npm/l/knex-aurora-data-api-client.svg)](https://www.npmjs.com/package/knex-aurora-data-api-client)

This is a fork of the knex-data-api-client by @alan-cooney to support both Postgres and Mysql

The **Knex Aurora Data API Client** is a Knex extension that supports the RDS Data API, built using [Jeremy Daily's](https://twitter.com/jeremy_daly) excellent [data-api-client](https://www.npmjs.com/package/data-api-client) module.

Support for transactions, and nestTables is included.

## Use

To use aurora in mysql mode:

```javascript
const knexDataApiClient = require("knex-aurora-data-api-client");
const knex = require("knex")({
  client: knexDataApiClient.mysql,
  connection: {
    secretArn: "secret-arn", // Required
    resourceArn: "db-resource-arn", // Required
    database: "db-name",
    region: "eu-west-2"
  }
});
```

To use aurora in postgres mode:

```javascript
const knexDataApiClient = require("knex-aurora-data-api-client");
const knex = require("knex")({
  client: knexDataApiClient.postgres,
  connection: {
    secretArn: "secret-arn", // Required
    resourceArn: "db-resource-arn", // Required
    database: "db-name",
    region: "eu-west-2"
  }
});
```

### Nested tables support

Note - this significantly increases the data required back from the RDS data api.

```javascript
knex()
  .doSomething()
  .options({ nestTables: true });
```

## Credits

Forked from [Skyhook](https://www.skyhookadventure.com) [knex-data-api-client](https://github.com/alan-cooney/knex-data-api-client) and provided under an MIT license.

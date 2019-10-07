# knex-data-api-client

Knex RDS Data API Client

[![npm](https://img.shields.io/npm/v/knex-data-api-client.svg)](https://www.npmjs.com/package/knex-data-api-client)
[![npm](https://img.shields.io/npm/l/knex-data-api-client.svg)](https://www.npmjs.com/package/knex-data-api-client)

The **Knex Data API Client** is a Knex extension that supports the RDS Data API, built using [Jeremy Daily's](https://twitter.com/jeremy_daly) excellent [data-api-client](https://www.npmjs.com/package/data-api-client) module.

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

### Nested tables support

Note - this significantly increases the data required back from the RDS data api.

```javascript
knex()
  .doSomething()
  .options({ nestTables: true });
```

## Credits

Built by the team at [Skyhook](https://www.skyhookadventure.com) and provided under an MIT license.

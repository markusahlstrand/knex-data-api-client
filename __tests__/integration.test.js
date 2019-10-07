const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const knexDataApiClient = require("..");
const knex = require("knex")({
  client: knexDataApiClient,
  connection: {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.RESOURCE_ARN,
    database: process.env.DB_NAME,
    region: process.env.REGION
  }
});

test("Connection", async () => {
  const test = await knex.raw("select 1+1 as result");
  expect(test.records[0].result).toBe(2);
});

test("Failed query", async () => {
  expect(knex.raw("select sadfasdfasdfasdf;")).rejects.toThrow("Unknown");
});

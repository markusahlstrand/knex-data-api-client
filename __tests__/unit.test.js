const knexFactory = require("knex");
const knexDataApiClient = require("..");
const sqlstring = require("../sqlstring");

test("Mysql query", async () => {
  const knex = knexFactory({
    client: knexDataApiClient.mysql,
    connection: {
      secretArn: "",
      resourceArn: "",
      database: "",
      region: "",
      dialect: "mysql"
    }
  });

  const query = knex
    .select("*")
    .from("test")
    .toString();
  expect(query).toBe("select * from `test`");
});

test("Postgres query", async () => {
  const knex = knexFactory({
    client: knexDataApiClient.postgres,
    connection: {
      secretArn: "",
      resourceArn: "",
      database: "",
      region: "",
      dialect: "postgres"
    }
  });

  const query = knex
    .select("*")
    .from("test")
    .toString();
  expect(query).toBe('select * from "test"');
});

test("Postgres params", async () => {
  const knex = knexFactory({
    client: knexDataApiClient.postgres,
    connection: {
      secretArn: "",
      resourceArn: "",
      database: "",
      region: "",
      dialect: "postgres"
    }
  });

  const query = knex
    .select("*")
    .from("test")
    .where({ foo: "bar" })
    .toString();
  expect(query).toBe('select * from "test" where "foo" = \'bar\'');
});

test("sqlstring", () => {
  const query = sqlstring.format('select * from "test" where "foo" = $1', [
    "bar"
  ]);

  expect(query).toBe('select * from "test" where "foo" = \'bar\'');
});

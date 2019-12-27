const { expect } = require('chai');

const { mysql } = require('./knexClient');

let counter = 0;

// test('Connection', async () => {
//   const test = await knex.raw('select 1+1 as result');
//   expect(test.records[0].result).toBe(2);
// });

// test('Failed query', async () => {
//   expect(knex.raw('select sadfasdfasdfasdf;')).rejects.toThrow('Unknown');
// });

describe('data-api-mysql', () => {
  before(async () => {
    const tables = await mysql
      .select('table_name')
      .from('information_schema.tables')
      .where({ TABLE_SCHEMA: 'Test' });

    const tableNames = tables.map((table) => table.table_name);

    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i];
      console.log(`Drop table ${tableName}`);
      await mysql.schema.dropTable(tableName);
    }
  });

  it('should create a test table', async () => {
    const tableName = 'test-' + counter++;

    await mysql.schema.createTable(tableName, (table) => {
      table.increments();
      table.string('value');
    });

    const rows = await mysql
      .select('table_name')
      .from('information_schema.tables')
      .where({ table_name: tableName });

    expect(rows.length).to.equal(1);
  });

  it('should insert a row', async () => {
    const tableName = 'test-' + counter++;

    await mysql.schema.createTable(tableName, (table) => {
      table.increments();
      table.string('value');
    });

    await mysql.table(tableName).insert({ value: 'test' });

    const rows = await mysql.select().from(tableName);

    expect(rows.length).to.equal(1);
  });

  it('should insert two rows in a transaction', async () => {
    const tableName = 'test-' + counter++;

    await mysql.schema.createTable(tableName, (table) => {
      table.increments();
      table.string('value');
    });

    await mysql.transaction(async (trx) => {
      await trx.table(tableName).insert({ value: 'Test1' });
      await trx.table(tableName).insert({ value: 'Test2' });
    });

    const rows = await mysql.select().from(tableName);

    expect(rows.length).to.equal(2);
  });
});
